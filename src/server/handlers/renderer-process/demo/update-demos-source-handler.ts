import type { DemoSource } from 'csdm/common/types/counter-strike';
import { updateDemosSource } from 'csdm/node/database/demos/update-demos-source';
import { handleError } from 'csdm/server/handlers/handle-error';

export type UpdateDemosSourcePayload = {
  checksums: string[];
  source: DemoSource;
};

export async function updateDemosSourceHandler({ checksums, source }: UpdateDemosSourcePayload) {
  try {
    await updateDemosSource(checksums, source);
  } catch (error) {
    handleError(error, 'Error while updating demos source');
  }
}
