import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { tryLock } = require('fs-native-extensions');
const fileDescriptor = fs.openSync(process.argv[2], 'a+');

if (!tryLock(fileDescriptor, { shared: process.argv[3] === 'shared' })) {
  process.exit(1);
}

process.stdout.write('locked\n');
setInterval(() => undefined, 1_000);
