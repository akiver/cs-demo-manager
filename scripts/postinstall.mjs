import { installDemoAnalyzer, installCsgoVoiceExtractor, installBoilerWritter } from './install-deps.mjs';

await Promise.all([installDemoAnalyzer(), installCsgoVoiceExtractor(), installBoilerWritter()]);
