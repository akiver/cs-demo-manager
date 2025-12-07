import { RenownApiError } from './errors/renown-api-error';
import { RenownInvalidRequest } from './errors/renown-invalid-request';
import { RenownResourceNotFound } from './errors/renown-resource-not-found';
import { RenownTooManyRequests } from './errors/renown-too-many-requests';

export function assertValidRenownResponse(response: Response): void {
  if (response.status === 400) {
    throw new RenownInvalidRequest();
  }

  if (response.status === 404) {
    throw new RenownResourceNotFound();
  }

  if (response.status === 429) {
    throw new RenownTooManyRequests();
  }

  if (response.status !== 200) {
    throw new RenownApiError(response.status);
  }
}
