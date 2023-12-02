import { Status } from 'csdm/common/types/status';
import { getCsgoTelnetConnection } from 'csdm/node/counter-strike/launcher/get-csgo-telnet-connection';

export async function getCsgoTelnetConnectionStatusHandler() {
  const connection = await getCsgoTelnetConnection();
  await connection?.destroy();
  return connection ? Status.Success : Status.Error;
}
