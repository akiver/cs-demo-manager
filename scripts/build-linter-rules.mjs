import { fileURLToPath } from 'node:url';
import fs from 'fs/promises';
import path from 'path';
import esbuild from 'esbuild';

async function main() {
  const rootFolderPath = fileURLToPath(new URL('..', import.meta.url));
  const rulesFolderPath = path.resolve(rootFolderPath, 'linter');
  const files = await fs.readdir(rulesFolderPath, {
    withFileTypes: true,
  });
  const tsFiles = files
    .filter((file) => file.isFile() && file.name.endsWith('.ts'))
    .map((file) => `${rulesFolderPath}/${file.name}`);

  const shouldWatch = process.argv.includes('--watch');
  const options = {
    entryPoints: tsFiles,
    bundle: false,
    outdir: rulesFolderPath,
    platform: 'node',
    format: 'cjs',
  };
  if (shouldWatch) {
    const ctx = await esbuild.context(options);
    await ctx.watch();
    console.log('Watching for changes');
  } else {
    const result = await esbuild.build(options);
    if (result.errors.length > 0) {
      console.error('Failed to build local linter rules.');
      console.error(result.errors);
      process.exit(1);
    }
    console.log('Local linter rules built successfully.');
  }
}

main();
