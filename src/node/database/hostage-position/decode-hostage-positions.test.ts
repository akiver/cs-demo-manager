import { describe, it, expect } from 'vite-plus/test';
import { packInt32, packFloat32 } from 'csdm/node/database/pack-values';
import { HostageState } from 'csdm/common/types/counter-strike';
import { decodeHostagePositions } from './decode-hostage-positions';

describe('decodeHostagePositions', () => {
  it('should decode the positions and the states', () => {
    const timeline = decodeHostagePositions({
      ticks: packInt32([66, 3596, 3597]),
      x: packFloat32([1357.5, 1357.5, 1360]),
      y: packFloat32([-585, -585, -580.25]),
      z: packFloat32([-159.875, -159.875, -159.875]),
      state_ticks: packInt32([66, 3590]),
      states: packInt32([HostageState.Idle, HostageState.BeingUntied]),
    });

    expect(timeline).toEqual({
      positions: [
        { tick: 66, x: 1357.5, y: -585, z: -159.875 },
        { tick: 3596, x: 1357.5, y: -585, z: -159.875 },
        { tick: 3597, x: 1360, y: -580.25, z: -159.875 },
      ],
      states: [
        { tick: 66, state: HostageState.Idle },
        { tick: 3590, state: HostageState.BeingUntied },
      ],
    });
  });
});
