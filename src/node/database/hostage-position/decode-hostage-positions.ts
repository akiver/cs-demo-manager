import type { HostageState } from 'csdm/common/types/counter-strike';
import type { HostageTimeline } from 'csdm/common/types/hostage-timeline';
import { createDataView } from 'csdm/node/database/create-data-view';
import { decodePackedPositions } from 'csdm/node/database/decode-packed-positions';
import type { HostagePositionTable } from './hostage-position-table';

type PackedHostagePositions = Omit<HostagePositionTable, 'match_checksum' | 'round_number'>;

export function decodeHostagePositions(packed: PackedHostagePositions): HostageTimeline {
  const stateTicks = createDataView(packed.state_ticks);
  const states = createDataView(packed.states);
  const count = packed.state_ticks.byteLength / 4;
  const hostageStates: HostageTimeline['states'] = [];
  for (let index = 0; index < count; index++) {
    const offset = index * 4;
    hostageStates.push({
      tick: stateTicks.getInt32(offset),
      state: states.getInt32(offset) as HostageState,
    });
  }

  return {
    positions: decodePackedPositions(packed),
    states: hostageStates,
  };
}
