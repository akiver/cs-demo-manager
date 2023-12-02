import { addFaceitAccount } from '../../../../node/database/faceit-account/add-faceit-account';
import { handleError } from '../../handle-error';

export async function addFaceitAccountHandler(nickname: string) {
  try {
    const account = await addFaceitAccount(nickname);

    return account;
  } catch (error) {
    handleError(error, `Error while adding FACEIT account with nickname ${nickname}`);
  }
}
