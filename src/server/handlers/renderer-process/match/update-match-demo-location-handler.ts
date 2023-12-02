import { updateMatchDemoLocation } from 'csdm/node/database/matches/update-match-demo-location';
import { getDemoChecksumFromDemoPath } from 'csdm/node/demo/get-demo-checksum-from-demo-path';
import { ChecksumsMismatch } from 'csdm/node/database/matches/errors/checksums-mismatch';
import { handleError } from '../../handle-error';

export type UpdateMatchDemoLocationPayload = {
  checksum: string;
  demoFilePath: string;
};

export async function updateMatchDemoLocationHandler({ demoFilePath, checksum }: UpdateMatchDemoLocationPayload) {
  try {
    const demoChecksum = await getDemoChecksumFromDemoPath(demoFilePath);
    if (demoChecksum !== checksum) {
      throw new ChecksumsMismatch();
    }
    await updateMatchDemoLocation(checksum, demoFilePath);
  } catch (error) {
    handleError(error, `Error while updating match demo location with checksum ${checksum}`);
  }
}
