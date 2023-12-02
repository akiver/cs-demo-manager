import { pathContainsInvalidCsgoChars } from 'csdm/common/string/path-contains-invalid-csgo-chars';
import { InvalidDemoPath } from './errors/invalid-demo-path';

export function assertDemoPathIsValid(demoPath: string) {
  if (pathContainsInvalidCsgoChars(demoPath)) {
    throw new InvalidDemoPath();
  }
}
