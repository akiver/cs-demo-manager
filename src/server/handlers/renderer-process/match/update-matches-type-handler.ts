import type { DemoType } from 'csdm/common/types/counter-strike';
import { updateMatchesType } from 'csdm/node/database/matches/update-matches-type';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';

export type UpdateMatchesTypePayload = {
  checksums: string[];
  type: DemoType;
};

export async function updateMatchesTypeHandler({ checksums, type }: UpdateMatchesTypePayload) {
  try {
    await updateMatchesType(checksums, type);
  } catch (error) {
    logger.error('Error while updating matches type');
    logger.error(error);
    const errorCode = getErrorCodeFromError(error);
    throw errorCode;
  }
}
