import type { ConnectOptions } from 'telnet-client';
import { Telnet } from 'telnet-client';

export const CSGO_TELNET_PORT = 2121;

export async function getCsgoTelnetConnection() {
  try {
    const connection = new Telnet();
    const options: ConnectOptions = {
      host: '127.0.0.1',
      port: CSGO_TELNET_PORT,
      negotiationMandatory: false,
      timeout: 1000,
    };
    await connection.connect(options);
    return connection;
  } catch (error) {
    logger.warn('CSGO telnet connection failed');
    logger.warn(error);
    return undefined;
  }
}
