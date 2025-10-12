import { startCounterStrikeWithHlae, type HlaeOptions } from './start-counter-strike-with-hlae';

type Options = HlaeOptions & {
  demoPath: string;
};

export async function watchDemoWithHlae(options: Options) {
  await startCounterStrikeWithHlae(options);
}
