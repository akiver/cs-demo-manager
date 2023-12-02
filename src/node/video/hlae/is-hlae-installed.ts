import { getHlaeExecutablePath } from './hlae-location';

export async function isHlaeInstalled(): Promise<boolean> {
  const executablePath = await getHlaeExecutablePath();

  return executablePath !== undefined;
}
