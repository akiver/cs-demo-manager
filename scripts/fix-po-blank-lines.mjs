// When we extract messages with the Lingui CLI there is only 1 blank line at the end of each file .po but when the
// Crowdin GitHub action generates a PR with the new messages there are 2 blank lines at the end of each file.
// This script aligns the files to have 2 blank lines to avoid unnecessary PRs.
// It should be run right after running the Lingui CLI extract command.
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { glob } from 'tinyglobby';

const rootFolderPath = fileURLToPath(new URL('..', import.meta.url));

const files = await glob('**/*.po', {
  cwd: path.resolve(rootFolderPath, 'src', 'ui', 'translations'),
  absolute: true,
});

for (const file of files) {
  const content = await fs.readFile(file, 'utf-8');
  const lines = content.split('\n');
  while (lines[lines.length - 1] === '') {
    lines.pop();
  }

  lines.push('', '');

  await fs.writeFile(file, lines.join('\n'));
}
