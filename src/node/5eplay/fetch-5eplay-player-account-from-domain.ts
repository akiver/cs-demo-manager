import { FiveEPlayInvalidRequest } from './errors/5eplay-invalid-request';
import { FiveEPlayResourceNotFound } from './errors/5eplay-resource-not-found';
import { FiveEPlayApiError } from './errors/5eplay-api-error';
import { fetch5EPlayPlayerProfile } from './fetch-5eplay-player-profile';

type IDTransferResponsePayload = {
  data: {
    uuid: string;
  };
};

async function fetchPlayerIdFromDomain(domain: string) {
  const response = await fetch('https://gate.5eplay.com/userinterface/http/v1/userinterface/idTransfer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ trans: { domain } }),
  });
  const data: IDTransferResponsePayload = await response.json();

  if (response.status === 400) {
    throw new FiveEPlayInvalidRequest();
  }

  if (response.status !== 200) {
    throw new FiveEPlayApiError(response.status);
  }

  const id = data.data.uuid;
  // 5EPlay don't rely on a 404 status code to indicate a non-existing player but rather an empty string in the payload
  if (id === '') {
    throw new FiveEPlayResourceNotFound();
  }

  return data.data.uuid;
}

export type FiveEPlayAccountDTO = {
  id: string;
  username: string;
  avatarUrl: string;
};

export async function fetch5EPlayAccount(domainId: string): Promise<FiveEPlayAccountDTO> {
  const playerId = await fetchPlayerIdFromDomain(domainId);
  const { username, avatarUrl } = await fetch5EPlayPlayerProfile(playerId, domainId);

  return { id: playerId, username, avatarUrl };
}
