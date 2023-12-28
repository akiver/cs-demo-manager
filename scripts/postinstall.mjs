import { installDemoAnalyzer, installCounterStrikeVoiceExtractor, installBoilerWritter } from './install-deps.mjs';

await Promise.all([installDemoAnalyzer(), installCounterStrikeVoiceExtractor(), installBoilerWritter()]);
