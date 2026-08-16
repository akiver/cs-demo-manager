import { describe, expect, it } from 'vite-plus/test';
import type { Settings } from '../settings';
import v14 from './v14';

describe('settings migration v14', () => {
  it('should keep existing installations on their external server', async () => {
    const settings = {
      database: {
        hostname: '192.168.1.10',
        port: 5433,
        username: 'postgres',
        password: 'password',
        database: 'csdm',
      },
    } as Settings;

    const migratedSettings = await v14.run(settings);

    expect(migratedSettings.database).toEqual({
      mode: 'external',
      hostname: '192.168.1.10',
      port: 5433,
      username: 'postgres',
      password: 'password',
      database: 'csdm',
    });
  });
});
