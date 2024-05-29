import fs from 'node:fs/promises';
import type { StatsBase } from 'node:fs';
import { InvalidBackupFile } from './errors/invalid-backup-file';
import { getSettings } from 'csdm/node/settings/get-settings';
import { findDemosInFolders } from 'csdm/node/demo/find-demos-in-folders';
import { getDemoHeader, type DemoHeader, type DemoHeaderSource1 } from 'csdm/node/demo/get-demo-header';
import { getDemoChecksumFromFileStats } from 'csdm/node/demo/get-demo-checksum-from-file-stats';
import { insertOrUpdateComment } from 'csdm/node/database/comments/insert-or-update-comment';
import { updateChecksumsTags } from 'csdm/node/database/tags/update-checksums-tags';
import { fetchTags } from 'csdm/node/database/tags/fetch-tags';
import { insertDefaultTags } from 'csdm/node/database/tags/insert-default-tags';
import { TagNotFound } from 'csdm/node/database/tags/errors/tag-not-found';
import { db } from '../database';

type DemoBackup = {
  Id: string;
  Comment: string;
  status: string;
};

export type ImportV2BackupOptions = {
  backupFilePath: string;
  importComments: boolean;
  importStatuses: boolean;
};

export type ImportV2BackupResult = {
  demoToImportCount: number;
  demoFoundCount: number;
  updatedDemoPaths: string[];
};

function getDemoIdV2(header: DemoHeaderSource1, stats: StatsBase<number>) {
  const seconds = Math.trunc(
    new Date(stats.mtime.getTime() - stats.mtime.getTimezoneOffset() * 60000).getTime() / 1000,
  );

  return `${header.mapName.replace('/', '')}_${header.signonLength}${header.playbackTicks}${header.playbackFrames}${seconds}${stats.size}`;
}

async function getDemosToImportFromBackupFile(options: ImportV2BackupOptions): Promise<DemoBackup[]> {
  try {
    const content = await fs.readFile(options.backupFilePath, 'utf-8');
    const data = JSON.parse(content);
    if (!Array.isArray(data.Demos)) {
      throw new InvalidBackupFile();
    }

    const demos: DemoBackup[] = [];
    for (const demo of data.Demos) {
      for (const key of ['Comment', 'Id', 'status']) {
        if (typeof demo[key] !== 'string') {
          throw new InvalidBackupFile();
        }
      }

      if ((options.importComments && demo.Comment !== '') || (options.importStatuses && demo.status !== 'None')) {
        demos.push(demo);
      }
    }

    return demos;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new InvalidBackupFile();
    }

    throw error;
  }
}

export async function importDataFromV2Backup(options: ImportV2BackupOptions): Promise<ImportV2BackupResult> {
  const result: ImportV2BackupResult = {
    demoToImportCount: 0,
    demoFoundCount: 0,
    updatedDemoPaths: [],
  };

  const demosToImport = await getDemosToImportFromBackupFile(options);
  if (demosToImport.length === 0) {
    return result;
  }
  result.demoToImportCount = demosToImport.length;

  const { folders } = await getSettings();
  const demoPaths = await findDemosInFolders(folders);
  if (demoPaths.length === 0) {
    return result;
  }
  result.demoFoundCount = demoPaths.length;

  await insertDefaultTags(db);

  const tags = await fetchTags();
  const toWatchTag = tags.find((tag) => tag.name === 'To watch');
  if (!toWatchTag) {
    throw new TagNotFound();
  }
  const watchedTag = tags.find((tag) => tag.name === 'Watched');
  if (!watchedTag) {
    throw new TagNotFound();
  }

  for (const demoPath of demoPaths) {
    let header: DemoHeader | undefined;
    try {
      header = await getDemoHeader(demoPath);
    } catch (error) {
      // Ignore invalid header
    }

    if (header?.filestamp !== 'HL2DEMO') {
      continue;
    }

    const stats = await fs.stat(demoPath);
    const idV2 = getDemoIdV2(header, stats);
    const demo = demosToImport.find((demo) => demo.Id === idV2);
    if (!demo) {
      continue;
    }

    const checksum = getDemoChecksumFromFileStats(header, stats);
    const shouldUpdateComment = options.importComments && demo.Comment !== '';
    if (shouldUpdateComment) {
      await insertOrUpdateComment(checksum, demo.Comment);
    }

    const shouldUpdateStatus = options.importStatuses && demo.status !== 'None';
    if (shouldUpdateStatus) {
      const tagId = demo.status === 'watched' ? watchedTag.id : toWatchTag.id;
      await updateChecksumsTags([checksum], [tagId]);
    }

    if (shouldUpdateComment || shouldUpdateStatus) {
      result.updatedDemoPaths.push(demoPath);
    }
  }

  return result;
}
