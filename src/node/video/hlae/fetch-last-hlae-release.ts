export async function fetchLastHlaeRelease() {
  const response = await fetch('https://api.github.com/repos/advancedfx/advancedfx/releases', {
    headers: {
      'User-Agent': 'CS:DM',
    },
  });
  const releases: GitHubReleaseResponse[] = await response.json();
  for (const release of releases) {
    if (release.prerelease) {
      continue;
    }

    return release;
  }

  throw new Error('No HLAE releases found');
}
