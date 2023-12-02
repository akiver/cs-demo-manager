import { writeBase64File } from 'csdm/node/filesystem/write-base64-file';

export type WriteBase64FilePayload = {
  filePath: string;
  data: string;
};

export async function writeBase64FileHandler({ filePath, data }: WriteBase64FilePayload) {
  await writeBase64File(filePath, data);
}
