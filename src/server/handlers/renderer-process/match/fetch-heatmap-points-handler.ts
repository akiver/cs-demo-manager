import type { HeatmapOptions } from 'csdm/common/types/heatmap-options';
import { HeatmapEvent } from 'csdm/common/types/heatmap-event';
import { fetchKillsPoints } from 'csdm/node/database/heatmap/fetch-kills-points';
import { fetchShotsPoints } from 'csdm/node/database/heatmap/fetch-shots-points';
import type { Point } from 'csdm/common/types/point';
import { fetchGrenadePoints } from 'csdm/node/database/heatmap/fetch-grenade-points';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import { assertNever } from 'csdm/common/assert-never';

export async function fetchHeatmapPointsHandler(heatmapOptions: HeatmapOptions) {
  try {
    let points: Point[] = [];
    switch (heatmapOptions.event) {
      case HeatmapEvent.Kills:
      case HeatmapEvent.Deaths:
        points = await fetchKillsPoints(heatmapOptions);
        break;
      case HeatmapEvent.Shots:
        points = await fetchShotsPoints(heatmapOptions);
        break;
      case HeatmapEvent.Molotov:
      case HeatmapEvent.HeGrenade:
      case HeatmapEvent.Flashbang:
      case HeatmapEvent.Smoke:
      case HeatmapEvent.Decoy:
        points = await fetchGrenadePoints(heatmapOptions);
        break;
      default:
        assertNever(heatmapOptions.event, `Unsupported heatmap event: ${heatmapOptions.event}`);
    }

    return points;
  } catch (error) {
    logger.error('Error while fetching heatmap points');
    logger.error(error);
    const errorCode = getErrorCodeFromError(error);
    throw errorCode;
  }
}
