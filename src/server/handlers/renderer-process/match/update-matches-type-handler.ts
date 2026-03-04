import type { DemoType } from 'csdm/common/types/counter-strike';
import { updateDemosType } from 'csdm/node/database/demos/update-demos-type';
import { handleError } from '../../handle-error';

export type UpdateMatchesTypePayload = {
  checksums: string[];
  type: DemoType;
};

export async function updateMatchesTypeHandler({ checksums, type }: UpdateMatchesTypePayload) {
  try {
    await updateDemosType(checksums, type);
  } catch (error) {
    handleError(error, 'Error while updating matches type');
  }
}
