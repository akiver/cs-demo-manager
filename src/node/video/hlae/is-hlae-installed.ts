import fs from 'fs-extra';
import { getHlaeExecutablePath } from './hlae-location';

export async function isHlaeInstalled(): Promise<boolean> {
  const executablePath = await getHlaeExecutablePath();
  const executableExists = await fs.pathExists(executablePath);

  return executableExists;
}
