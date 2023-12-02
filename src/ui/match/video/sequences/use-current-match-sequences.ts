import { useSequencesByDemoFilePath } from './use-sequences-by-demo-file-path';
import type { Sequence } from 'csdm/common/types/sequence';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';

export function useCurrentMatchSequences(): Sequence[] {
  const currentMatch = useCurrentMatch();
  const sequencesByDemoFilePath = useSequencesByDemoFilePath();

  return sequencesByDemoFilePath[currentMatch.demoFilePath] || [];
}
