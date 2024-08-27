export async function isDownloadLinkExpired(demoUrl: string) {
  if (!demoUrl) {
    return true;
  }

  try {
    const response = await fetch(demoUrl, {
      method: 'HEAD',
    });

    return response.status !== 200;
  } catch (error) {
    return true;
  }
}
