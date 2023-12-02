import type { Demo } from 'csdm/common/types/demo';
import { deleteDemos } from 'csdm/node/demo/delete-demos';

export type DeleteDemosResultPayload = {
  deletedDemos: Demo[];
  notDeletedDemos: Demo[];
};

export async function deleteDemosHandler(demos: Demo[]) {
  const { deletedDemos, notDeletedDemos } = await deleteDemos(demos);

  const payload: DeleteDemosResultPayload = {
    deletedDemos,
    notDeletedDemos,
  };

  return payload;
}
