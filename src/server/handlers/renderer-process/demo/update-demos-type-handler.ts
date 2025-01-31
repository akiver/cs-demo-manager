import type { DemoType } from 'csdm/common/types/counter-strike';
import { updateDemosType } from 'csdm/node/database/demos/update-demos-type';
import { handleError } from '../../handle-error';

export type UpdateDemosTypePayload = {
  checksums: string[];
  type: DemoType;
};

export async function updateDemosTypeHandler({ checksums, type }: UpdateDemosTypePayload) {
  try {
    await updateDemosType(checksums, type);
  } catch (error) {
    handleError(error, 'Error while updating demos type');
  }
}
