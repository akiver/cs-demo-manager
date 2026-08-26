// @ts-check
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);

// Rolldown plugin to support native Node.js modules (.node files).
// When a bundled module imports a ".node" file, the file is emitted next to the output bundle and the import is
// replaced by a stub module that loads it with require() at runtime, relative to the bundle.
// The require() call is wrapped in a try/catch because some native modules are platform specific (e.g. registry-js
// only works on Windows).
/** @type {import('vite/rolldown').Plugin} */
const nativeNodeModulesPlugin = {
  name: 'native-node-modules',
  resolveId: {
    filter: { id: /\.node$/ },
    handler(source, importer) {
      // The require() emitted by the load hook below must be kept as-is in the output so the .node file is loaded
      // at runtime (its importer is the .node module itself). A .node file is never an entry point, so the importer
      // is always defined otherwise.
      if (importer === undefined || importer.endsWith('.node')) {
        return {
          id: source,
          external: true,
        };
      }

      return require.resolve(source, { paths: [path.dirname(importer)] });
    },
  },
  load: {
    filter: { id: /\.node$/ },
    handler(id) {
      // The basename is used as-is (no content hash), it would collide if two native modules had the same filename.
      const fileName = path.basename(id);
      this.emitFile({
        type: 'asset',
        fileName,
        source: fs.readFileSync(id),
      });

      return {
        code: `let nativeModule;
try {
  nativeModule = require(${JSON.stringify(`./${fileName}`)});
} catch {}
module.exports = nativeModule;`,
      };
    },
  },
};

export default nativeNodeModulesPlugin;
