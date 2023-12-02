import fs from 'fs-extra';

export async function deleteVdmFile(demoPath: string) {
  const vdmFilePath = `${demoPath.slice(0, -3)}vdm`;
  await fs.remove(vdmFilePath);
}
