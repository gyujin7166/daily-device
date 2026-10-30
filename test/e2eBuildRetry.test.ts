// @vitest-environment node

import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const workflow = readFileSync('.github/workflows/e2e.yml', 'utf8').replace(
  /\r\n/g,
  '\n',
);
const buildScript = workflow
  .split('      - name: Run production build\n')[1]
  .split('        run: |\n')[1]
  .split('\n      - name:')[0]
  .replace(/^ {10}/gm, '');
const bash =
  process.platform === 'win32'
    ? join(process.env.ProgramFiles ?? 'C:\\Program Files', 'Git/bin/bash.exe')
    : 'bash';

function runBuild(failures: string[]) {
  const directory = mkdtempSync(join(tmpdir(), 'e2e-build-retry-'));

  try {
    [...failures, ''].forEach((log, index) => {
      writeFileSync(join(directory, `build-${index + 1}.log`), log);
    });
    writeFileSync(join(directory, 'build-calls'), '');
    writeFileSync(join(directory, 'sleep-calls'), '');

    const result = spawnSync(
      bash,
      ['--noprofile', '--norc', '-e', '-o', 'pipefail'],
      {
        encoding: 'utf8',
        timeout: 10_000,
        env: {
          ...process.env,
          RUNNER_TEMP: directory.replace(/\\/g, '/'),
        },
        input: `
npm() {
  printf '%s\\n' "$*" >> "$RUNNER_TEMP/build-calls"
  local attempt
  attempt=$(wc -l < "$RUNNER_TEMP/build-calls")
  cat "$RUNNER_TEMP/build-$attempt.log" >&2 || return 99
  [ ! -s "$RUNNER_TEMP/build-$attempt.log" ]
}
sleep() {
  printf '%s\\n' "$*" >> "$RUNNER_TEMP/sleep-calls"
}
${buildScript}`,
      },
    );

    if (result.error) throw result.error;

    return {
      status: result.status,
      output: result.stdout + result.stderr,
      builds: readFileSync(join(directory, 'build-calls'), 'utf8'),
      sleeps: readFileSync(join(directory, 'sleep-calls'), 'utf8'),
    };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

describe('E2E production build retry', () => {
  it('continues immediately when the first build succeeds', () => {
    const result = runBuild([]);

    expect(result.status).toBe(0);
    expect(result.builds).toBe('run build\n');
    expect(result.sleeps).toBe('');
  });

  it.each([
    'P1001',
    "Can't reach database server",
    'Invalid prisma.product.findFirst() invocation\nError opening a TLS connection: unexpected EOF',
    'error opening a tls connection: unexpected eof',
  ])('retries a transient error and accepts the second build: %s', (error) => {
    const result = runBuild([error]);

    expect(result.status).toBe(0);
    expect(result.builds).toBe('run build\nrun build\n');
    expect(result.sleeps).toBe('10\n');
    expect(result.output).toContain(
      'transient E2E database/TLS connection error',
    );
    expect(result.output).toContain('attempt 1/3');
  });

  it('accepts a successful third build after two transient failures', () => {
    const result = runBuild([
      'P1001',
      'Error opening a TLS connection: unexpected EOF',
    ]);

    expect(result.status).toBe(0);
    expect(result.builds).toBe('run build\nrun build\nrun build\n');
    expect(result.sleeps).toBe('10\n10\n');
    expect(result.output).toContain('attempt 2/3');
  });

  it.each([
    'Type error: Type string is not assignable to type number',
    'Failed to compile: Module not found',
    'Invalid route configuration',
    'ReferenceError: product is not defined',
    'Environment variable not found: DATABASE_URL',
    'P1000: Authentication failed against database server',
    'P1011: Error opening a TLS connection: certificate verify failed',
    'SyntaxError: unexpected EOF',
  ])('fails immediately for a non-transient error: %s', (error) => {
    const result = runBuild([error]);

    expect(result.status).toBe(1);
    expect(result.builds).toBe('run build\n');
    expect(result.sleeps).toBe('');
    expect(result.output).toContain('failed with a non-transient error');
  });

  it('does not reuse a previous transient error when the next failure is a code error', () => {
    const result = runBuild(['P1001', 'Failed to compile: Module not found']);

    expect(result.status).toBe(1);
    expect(result.builds).toBe('run build\nrun build\n');
    expect(result.sleeps).toBe('10\n');
    expect(result.output).toContain('failed with a non-transient error');
  });

  it('fails after three transient failures without waiting again', () => {
    const result = runBuild(
      Array(3).fill('Error opening a TLS connection: unexpected EOF'),
    );

    expect(result.status).toBe(1);
    expect(result.builds).toBe('run build\nrun build\nrun build\n');
    expect(result.sleeps).toBe('10\n10\n');
    expect(result.output).toContain(
      'Production build still cannot connect reliably to the E2E database after retries.',
    );
  });
});
