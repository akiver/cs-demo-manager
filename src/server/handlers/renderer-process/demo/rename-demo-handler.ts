import { renameDemo } from 'csdm/node/database/demos/rename-demo';
import { handleError } from '../../handle-error';

export type RenameDemoPayload = {
  checksum: string;
  name: string;
};

export async function renameDemoHandler({ checksum, name }: RenameDemoPayload) {
  try {
    await renameDemo(checksum, name);
  } catch (error) {
    handleError(error, `Error while renaming demo with checksum ${checksum} to ${name}`);
  }
}
