import { useMatchChecksums } from 'csdm/ui/cache/use-match-checksums';

export function useIsDemoInDatabase() {
  const matchChecksums = useMatchChecksums();

  return (demoChecksum: string) => {
    return matchChecksums.includes(demoChecksum);
  };
}
