import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

config({ path: '.env.local', quiet: true });
config({ quiet: true });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required.');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'npm run db:seed',
  },
});
