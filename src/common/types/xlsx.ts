export type ExportToXlsxProgressPayload = {
  count: number;
  totalCount: number;
};

export type ExportToXlsxSuccessPayload = {
  outputType: 'file' | 'folder';
  outputPath: string;
};
