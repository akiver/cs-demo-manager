import fs from 'fs-extra';

export async function deleteJsonActionsFile(demoPath: string) {
  await fs.remove(`${demoPath}.json`);
}
