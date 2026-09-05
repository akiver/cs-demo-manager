import {
  installDemoAnalyzer,
  installCounterStrikeVoiceExtractor,
  installBoilerWritter,
  installEmbeddedPostgreSql,
} from './install-deps.mjs';

const installations = [installDemoAnalyzer(), installCounterStrikeVoiceExtractor(), installBoilerWritter()];
// The PostgreSQL binaries are only needed to run the app, CI jobs that validate the code don't need to download
// them. Packaging installs them for the target platform anyway.
if (process.env.CI === 'true') {
  console.log('CI environment detected, skipping the embedded PostgreSQL binaries installation');
} else {
  installations.push(installEmbeddedPostgreSql());
}

await Promise.all(installations);
