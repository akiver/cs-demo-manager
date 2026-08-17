export async function isDownloadLinkExpired(demoUrl: string, signal?: AbortSignal) {
  if (!demoUrl) {
    return true;
  }

  try {
    const response = await fetch(demoUrl, {
      method: 'HEAD',
      signal,
    });

    return response.status !== 200;
  } catch (error) {
    signal?.throwIfAborted();
    return true;
  }
}
