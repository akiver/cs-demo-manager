export const ExportVoiceMode = {
  SplitCompact: 'split-compact',
  SplitFull: 'split-full',
  SingleFull: 'single-full',
} as const;

export type ExportVoiceMode = (typeof ExportVoiceMode)[keyof typeof ExportVoiceMode];
