import {
  installDemoAnalyzer,
  installCounterStrikeVoiceExtractor,
  installBoilerWritter,
  installPostgres,
} from './install-deps.mjs';

// The PostgreSQL binaries are downloaded from Maven Central, unlike the other dependencies which are
// copied from node_modules. A network failure must not break the install: they are only required to
// run the app with the embedded database, not to lint, type-check or test it.
// Packaging installs them again through the electron-builder beforePack hook, where it is fatal.
async function installPostgresBinaries() {
  try {
    await installPostgres();
  } catch (error) {
    console.warn(`Failed to install the PostgreSQL binaries, the embedded database will not start.`);
    console.warn(error.message);
  }
}

await Promise.all([
  installDemoAnalyzer(),
  installCounterStrikeVoiceExtractor(),
  installBoilerWritter(),
  installPostgresBinaries(),
]);
