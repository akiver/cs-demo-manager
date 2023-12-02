import type { DemoType } from 'csdm/common/types/counter-strike';
import { updateDemosType } from 'csdm/node/database/demos/update-demos-type';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';

export type UpdateDemosTypePayload = {
  checksums: string[];
  type: DemoType;
};

export async function updateDemosTypeHandler({ checksums, type }: UpdateDemosTypePayload) {
  try {
    await updateDemosType(checksums, type);
  } catch (error) {
    logger.error('Error while updating demos type');
    logger.error(error);
    const errorCode = getErrorCodeFromError(error);
    throw errorCode;
  }
}
