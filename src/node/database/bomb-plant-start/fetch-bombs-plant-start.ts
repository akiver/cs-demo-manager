import { db } from 'csdm/node/database/database';
import { bombPlantStartRowToBombPlantStart } from './bomb-plant-start-row-to-bomb-plant-start';

export async function fetchBombsPlantStart(checksum: string, roundNumber: number) {
  const rows = await db
    .selectFrom('bombs_plant_start')
    .selectAll()
    .where('match_checksum', '=', checksum)
    .where('round_number', '=', roundNumber)
    .execute();

  const bombsPlantStart = rows.map((row) => {
    return bombPlantStartRowToBombPlantStart(row);
  });

  return bombsPlantStart;
}
