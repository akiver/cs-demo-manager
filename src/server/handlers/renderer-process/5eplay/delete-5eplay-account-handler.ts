import { handleError } from '../../handle-error';
import { fetch5EPlayAccounts } from 'csdm/node/database/5play-account/fetch-5eplay-accounts';
import { delete5EPlayAccount } from 'csdm/node/database/5play-account/delete-5eplay-account';

export async function delete5EPlayAccountHandler(accountId: string) {
  try {
    await delete5EPlayAccount(accountId);
    const accounts = await fetch5EPlayAccounts();

    return accounts;
  } catch (error) {
    handleError(error, `Error while deleting 5EPlay account with id ${accountId}`);
  }
}
