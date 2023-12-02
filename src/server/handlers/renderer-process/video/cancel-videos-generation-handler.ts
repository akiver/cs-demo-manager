import { videoAbortController } from './generate-videos-handler';

export async function cancelVideosGenerationHandler() {
  videoAbortController.abort();
  return Promise.resolve();
}
