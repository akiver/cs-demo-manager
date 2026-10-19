import { describe, it, expect } from 'vite-plus/test';
import { GrenadeName } from 'csdm/common/types/counter-strike';
import { decodeGrenadePositions } from './decode-grenade-positions';

function packInt32(values: number[]) {
  const buffer = Buffer.alloc(values.length * 4);
  values.forEach((value, index) => buffer.writeInt32BE(value, index * 4));

  return buffer;
}

function packFloat32(values: number[]) {
  const buffer = Buffer.alloc(values.length * 4);
  values.forEach((value, index) => buffer.writeFloatBE(value, index * 4));

  return buffer;
}

const thrower = {
  grenade_id: '10',
  projectile_id: '20',
  grenade_name: GrenadeName.Smoke,
  thrower_steam_id: '76561198000000000',
  thrower_name: 'Player',
  thrower_side: 3,
  thrower_team_name: 'Team',
  thrower_velocity_x: 1.5,
  thrower_velocity_y: -2.5,
  thrower_velocity_z: 0,
  thrower_yaw: 90,
  thrower_pitch: -10,
} as const;

describe('decodeGrenadePositions', () => {
  it('should decode big-endian packed positions', () => {
    const timeline = decodeGrenadePositions({
      ...thrower,
      ticks: packInt32([100, 101, 160]),
      x: packFloat32([450, 470.5, 470.5]),
      y: packFloat32([-120, -110.25, -110.25]),
      z: packFloat32([64, 70, 70]),
    });

    expect(timeline).toEqual({
      grenadeId: '10',
      projectileId: '20',
      grenadeName: GrenadeName.Smoke,
      throwerSteamId: '76561198000000000',
      throwerName: 'Player',
      throwerSide: 3,
      throwerTeamName: 'Team',
      throwerVelocityX: 1.5,
      throwerVelocityY: -2.5,
      throwerVelocityZ: 0,
      throwerYaw: 90,
      throwerPitch: -10,
      positions: [
        { tick: 100, x: 450, y: -120, z: 64 },
        { tick: 101, x: 470.5, y: -110.25, z: 70 },
        { tick: 160, x: 470.5, y: -110.25, z: 70 },
      ],
    });
  });

  it('should decode buffers that are not aligned on 4 bytes', () => {
    const unaligned = (buffer: Buffer) => Buffer.concat([Buffer.from([0]), buffer]).subarray(1);

    const { positions } = decodeGrenadePositions({
      ...thrower,
      ticks: unaligned(packInt32([42])),
      x: unaligned(packFloat32([1.5])),
      y: unaligned(packFloat32([2.5])),
      z: unaligned(packFloat32([3.5])),
    });

    expect(positions).toEqual([{ tick: 42, x: 1.5, y: 2.5, z: 3.5 }]);
  });
});
