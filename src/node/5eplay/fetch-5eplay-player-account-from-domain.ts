import { FiveEPlayApiError } from './errors/5eplay-api-error';
import { FiveEPlayInvalidRequest } from './errors/5eplay-invalid-request';
import { FiveEPlayResourceNotFound } from './errors/5eplay-resource-not-found';

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

type UserInterfaceHeaderResponseSuccess = {
  data: {
    header: {
      user_data: {
        avatar_url: string;
        username: string;
      };
    };
  };
};

type UserInterfaceHeaderResponsePayload =
  | UserInterfaceHeaderResponseSuccess
  | {
      reason: 'USER_NOT_FOUND';
    };

async function fetchPlayerInformation(id: string) {
  const response = await fetch(`https://gate.5eplay.com/userinterface/pt/v1/userinterface/header/${id}`);

  if (response.status === 500) {
    // The API returns a 500 status code when the player doesn't exist ¯\_(ツ)_/¯
    try {
      const data: UserInterfaceHeaderResponsePayload = await response.json();

      if ('reason' in data && data.reason === 'USER_NOT_FOUND') {
        throw new FiveEPlayResourceNotFound();
      }
    } catch (error) {
      throw new FiveEPlayApiError(response.status);
    }

    throw new FiveEPlayApiError(response.status);
  }

  if (response.status !== 200) {
    throw new FiveEPlayApiError(response.status);
  }

  const data: UserInterfaceHeaderResponseSuccess = await response.json();
  const userData = data.data.header.user_data;

  return {
    username: userData.username,
    avatarUrl: `https://oss-arena.5eplay.com/${userData.avatar_url}`,
  };
}

export type FiveEPlayAccountDTO = {
  id: string;
  username: string;
  avatarUrl: string;
};

export async function fetch5EPlayAccount(domainId: string): Promise<FiveEPlayAccountDTO> {
  const playerId = await fetchPlayerIdFromDomain(domainId);
  const { username, avatarUrl } = await fetchPlayerInformation(playerId);

  return { id: playerId, username, avatarUrl };
}
