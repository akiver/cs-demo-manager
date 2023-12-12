import fs from 'fs-extra';
import { Game } from 'csdm/common/types/counter-strike';
import { InvalidDemoHeader } from 'csdm/node/demo/errors/invalid-demo-header';
import { assertDemoExists } from './assert-demo-exists';

export async function detectDemoGame(demoPath: string): Promise<Game> {
  await assertDemoExists(demoPath);

  const fd = await fs.open(demoPath, 'r');

  try {
    const bufferSize = 8;
    const buffer = Buffer.alloc(bufferSize);
    await fs.read(fd, buffer, 0, bufferSize, null);
    const filestamp = buffer.toString('utf8', 0, 8).replaceAll('\0', '');

    if (filestamp === 'HL2DEMO') {
      return Game.CSGO;
    }

    if (filestamp === 'PBDEMS2') {
      return Game.CS2;
    }

    throw new InvalidDemoHeader(`Invalid filestamp ${filestamp}`);
  } finally {
    await fs.close(fd);
  }
}
