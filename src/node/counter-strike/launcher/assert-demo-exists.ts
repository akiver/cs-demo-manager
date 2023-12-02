import fs from 'fs-extra';
import { DemoNotFound } from './errors/demo-not-found';

export async function assertDemoExists(demoPath: string) {
  const fileExists = await fs.pathExists(demoPath);
  if (!fileExists) {
    throw new DemoNotFound();
  }
}
