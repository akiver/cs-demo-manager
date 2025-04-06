/* eslint-disable @typescript-eslint/no-explicit-any */
import path from 'node:path';
import { format } from 'node:util';
import fs from 'fs-extra';
import type { FSWatcher } from 'chokidar';
import { watch } from 'chokidar';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';

export interface ILogger {
  log: (...data: any[]) => void;
  warn: (...data: any[]) => void;
  error: (...data: any[]) => void;
  getLogFilePath: () => string;
  clear: () => Promise<void>;
}

type Level = 'log' | 'warn' | 'error';

class Logger implements ILogger {
  private logFolderPath: string;
  private logFilePath: string;
  private fileStream: fs.WriteStream | null = null;
  private watcher: FSWatcher | null = null;
  private cache: any[] = [];
  private shouldLogToGlobalConsole = true;

  public constructor() {
    this.logFolderPath = path.join(getAppFolderPath(), 'logs');
    this.logFilePath = path.join(this.logFolderPath, 'csdm.log');
    // We only call the global Console methods when we are in development build or in the Electron renderer process
    // for the following reasons:
    // - On Windows AND in production build it may actually block the server process when logging large chunks of data.
    // - The Electron main process and WebSocket server processes stdout are never visible in production since there
    // is no terminal / window involved.
    //
    // Note:
    // process.type => "renderer" in development build as we start it from an Electron window
    // process.type => undefined in production build
    // This flag has been added after noticing that on Windows, logging the insertion of many demos NOT already in the
    // database (tested with 256 demos) it blocks the WebSocket server process in production build.
    this.shouldLogToGlobalConsole = IS_DEV || process.type === 'renderer';
  }

  public log = (...data: any[]) => {
    this.logToConsole(data, 'log');
    this.writeLogToFile(data, 'log');
  };

  public warn = (...data: any[]) => {
    this.logToConsole(data, 'warn');
    this.writeLogToFile(data, 'warn');
  };

  public error = (...data: any[]) => {
    this.logToConsole(data, 'error');
    this.writeLogToFile(data, 'error');
  };

  public getLogFilePath = () => {
    return this.logFilePath;
  };

  public clear = async () => {
    const fileExists = await fs.pathExists(this.logFilePath);
    if (!fileExists) {
      return;
    }

    try {
      await fs.writeFile(this.logFilePath, '');
    } catch (error) {
      this.error('Failed to clear log file', error);
      throw error;
    }
  };

  private logToConsole = (data: any[], level: Level) => {
    if (this.shouldLogToGlobalConsole) {
      console[level](...data);
    }
  };

  private jsonStringifyReplacer = (key: any, value: any) => {
    if (value instanceof Error) {
      if (value.cause) {
        return `${value.stack}\n\tCAUSE: ${value.cause}`;
      }

      return value.stack;
    }

    if (!value) {
      return value;
    }

    if (typeof value.toJSON === 'function') {
      return value.toJSON();
    }

    if (typeof value === 'function') {
      return '[function] ' + value.toString();
    }

    if (typeof value === 'object' && value !== null) {
      // Avoid possible circular reference
      if (this.cache.includes(value)) {
        return;
      }

      this.cache.push(value);
    }

    return value;
  };

  private formatDataToWrite = (...data: any[]) => {
    const json = data.map((value) => {
      if (value === undefined) {
        return undefined;
      }

      const string = JSON.stringify(value, this.jsonStringifyReplacer, 2);
      this.cache = [];

      if (string === undefined) {
        return undefined;
      }

      return JSON.parse(string);
    });

    return format(...json);
  };

  private buildLogLine = (data: any[], level: Level) => {
    const prefix = `${new Date().toISOString()} | ${level.toUpperCase()} | ${process.env.PROCESS_NAME} |`;

    return `${prefix} ${this.formatDataToWrite(...data)}\n`;
  };

  private onFileDeleted = () => {
    this.fileStream?.close();
    this.fileStream = null;
  };

  private ensureLogFileExists = async () => {
    await fs.ensureFile(this.logFilePath);
  };

  private clearLogsIfFileMaxSizeReached = async () => {
    const { size } = await fs.stat(this.logFilePath);
    const fileSizeInMegabytes = size / (1024 * 1024);
    if (fileSizeInMegabytes > 1) {
      await this.clear();
    }
  };

  private watchForFileDeletion = () => {
    this.watcher?.close();
    this.watcher = watch(this.logFolderPath).on('unlink', this.onFileDeleted);
  };

  private writeLogToFile = async (data: any[], level: Level) => {
    await this.ensureLogFileExists();
    await this.clearLogsIfFileMaxSizeReached();

    if (this.fileStream === null) {
      this.fileStream = fs.createWriteStream(this.logFilePath, { flags: 'a' });
      this.watchForFileDeletion();
    }

    const line = this.buildLogLine(data, level);
    this.fileStream.write(line);
  };
}

globalThis.logger = new Logger();
