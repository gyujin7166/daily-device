import { BadRequestError } from '@shared/lib/errors/httpError';

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new BadRequestError('Invalid JSON');
  }
}
