export const XlsxOutputType = {
  SingleFile: 'single-file',
  MultipleFiles: 'multiple-files',
} as const;
export type XlsxOutputType = (typeof XlsxOutputType)[keyof typeof XlsxOutputType];

export type XlsxOutput = {
  type: 'file' | 'folder';
  path: string;
};
