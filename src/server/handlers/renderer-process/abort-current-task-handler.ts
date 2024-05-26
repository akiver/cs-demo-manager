import { abortRendererController } from 'csdm/server/abort-controller';

export async function abortCurrentTaskHandler() {
  abortRendererController();

  return Promise.resolve();
}
