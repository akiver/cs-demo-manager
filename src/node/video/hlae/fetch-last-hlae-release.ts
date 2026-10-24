export async function fetchLastHlaeRelease() {
  const response = await fetch('https://api.github.com/repos/advancedfx/advancedfx/releases/latest', {
    headers: {
      'User-Agent': 'CS:DM',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch the latest HLAE release, status: ${response.status}`);
  }

  const release: GitHubReleaseResponse = await response.json();

  return release;
}
