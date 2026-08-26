import { fileURLToPath } from 'node:url';
import fs from 'fs/promises';
import path from 'path';
import { build, watch } from 'vite/rolldown';

async function main() {
  const rootFolderPath = fileURLToPath(new URL('..', import.meta.url));
  const rulesFolderPath = path.resolve(rootFolderPath, 'linter');
  const files = await fs.readdir(rulesFolderPath, {
    withFileTypes: true,
  });
  const tsFiles = files
    .filter((file) => file.isFile() && file.name.endsWith('.ts'))
    .map((file) => `${rulesFolderPath}/${file.name}`);

  const options = {
    input: tsFiles,
    platform: 'node',
    // Only transpile the rule files, keep all their imports external.
    external: () => true,
    output: {
      dir: rulesFolderPath,
      format: 'esm',
      entryFileNames: '[name].js',
    },
  };

  const shouldWatch = process.argv.includes('--watch');
  if (shouldWatch) {
    const watcher = watch(options);
    watcher.on('event', (event) => {
      if (event.code === 'ERROR') {
        console.error(event.error);
      } else if (event.code === 'END') {
        console.log('Local linter rules built successfully.');
      }
    });
    console.log('Watching for changes');
  } else {
    try {
      await build(options);
    } catch (error) {
      console.error('Failed to build local linter rules.');
      console.error(error);
      process.exit(1);
    }
    console.log('Local linter rules built successfully.');
  }
}

main();
