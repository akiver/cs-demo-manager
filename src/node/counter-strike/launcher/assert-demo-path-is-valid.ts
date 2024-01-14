import { pathContainsInvalidCsgoChars } from 'csdm/common/string/path-contains-invalid-csgo-chars';
import { InvalidDemoPath } from './errors/invalid-demo-path';
import { stringContainsOnlyBasicLatinChars } from 'csdm/common/string/string-contains-only-basic-latin-chars';
import { Game } from 'csdm/common/types/counter-strike';

export function assertDemoPathIsValid(demoPath: string, game: Game) {
  // All chars seem to be supported on CS2
  if (game === Game.CSGO) {
    if (pathContainsInvalidCsgoChars(demoPath)) {
      throw new InvalidDemoPath();
    }
  }

  if (!stringContainsOnlyBasicLatinChars(demoPath)) {
    throw new InvalidDemoPath();
  }
}
