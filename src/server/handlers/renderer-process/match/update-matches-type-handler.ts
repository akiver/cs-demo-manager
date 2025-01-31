import type { DemoType } from 'csdm/common/types/counter-strike';
import { updateMatchesType } from 'csdm/node/database/matches/update-matches-type';
import { handleError } from '../../handle-error';

export type UpdateMatchesTypePayload = {
  checksums: string[];
  type: DemoType;
};

export async function updateMatchesTypeHandler({ checksums, type }: UpdateMatchesTypePayload) {
  try {
    await updateMatchesType(checksums, type);
  } catch (error) {
    handleError(error, 'Error while updating matches type');
  }
}
