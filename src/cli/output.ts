import { styleText } from 'node:util';
import { alignColumns, truncate } from './format';

type Style = Parameters<typeof styleText>[0];

type FailedDemo = {
  demoPath: string;
  // Details such as the analyzer output, printed at the end to not interleave long outputs with the progress.
  details: string;
};

export type TableCell = string | { text: string; style: Style };

export const Verbosity = {
  Quiet: 'quiet', // Only the errors and the data requested, such as the JSON or a table.
  Normal: 'normal',
  Verbose: 'verbose', // The debug messages too.
} as const;
type Verbosity = (typeof Verbosity)[keyof typeof Verbosity];

type Summary = {
  succeeded: number;
  // Describes the succeeded items, e.g. "analyzed".
  label: string;
  skipped?: number;
  failed?: number;
};

class Output {
  // Stream of the messages and the progress, stderr in JSON mode so that stdout contains only the JSON.
  private messageStream: NodeJS.WriteStream = process.stdout;
  private isJsonMode = false;
  private verbosity: Verbosity = Verbosity.Normal;
  private progressMessage = '';
  private isProgressDisplayed = false;
  private readonly writeToStdout = process.stdout.write.bind(process.stdout);
  private readonly writeToStderr = process.stderr.write.bind(process.stderr);

  public constructor() {
    this.interceptWrites(process.stdout);
    this.interceptWrites(process.stderr);
    // Otherwise the shell prompt would be displayed after the progress message when the process exits.
    process.on('exit', () => {
      this.clearProgress();
    });
  }

  private get isInteractive() {
    return this.messageStream.isTTY === true && process.env.CI === undefined && process.env.TERM !== 'dumb';
  }

  /**
   * Prints the messages and the progress on stderr, stdout then contains only the JSON printed with json() so that it
   * can be piped to another program.
   */
  public enableJsonMode() {
    this.clearProgress();
    this.messageStream = process.stderr;
    this.isJsonMode = true;
  }

  public setVerbosity(verbosity: Verbosity) {
    this.verbosity = verbosity;
  }

  public json(data: unknown) {
    this.clearProgress();
    // The original write function, the intercepted one redirects stdout writes to stderr in JSON mode.
    this.writeToStdout(`${JSON.stringify(data, null, 2)}\n`);
  }

  /**
   * Resolves once the pending writes have been flushed, writes to a pipe are asynchronous on macOS and process.exit()
   * would drop the ones not written yet, truncating the output.
   */
  public async flush() {
    const flushStream = (write: typeof this.writeToStdout) => {
      return new Promise<void>((resolve) => {
        write('', () => {
          resolve();
        });
      });
    };
    await Promise.all([flushStream(this.writeToStdout), flushStream(this.writeToStderr)]);
  }

  public log(message: string) {
    if (this.verbosity !== Verbosity.Quiet) {
      this.print(message);
    }
  }

  public print(message: string) {
    this.messageStream.write(`${message}\n`);
  }

  public debug(message: string) {
    if (this.verbosity === Verbosity.Verbose) {
      const elapsedTime = `[${(performance.now() / 1000).toFixed(2)}s]`;
      console.error(this.style('dim', `${elapsedTime} ${message}`, process.stderr));
    }
  }

  public success(message: string) {
    this.log(`${this.style('green', '✔')} ${message}`);
  }

  public error(message: string) {
    const [firstLine, ...details] = message.split('\n');
    console.error([this.style('red', firstLine, process.stderr), ...details].join('\n'));
  }

  public hint(message: string) {
    console.error(this.style('dim', message, process.stderr));
  }

  public formatPath(path: string) {
    return this.style('dim', path);
  }

  public progress(message: string) {
    if (this.verbosity === Verbosity.Quiet) {
      return;
    }

    if (this.isInteractive) {
      this.renderProgress(message);
    } else {
      this.log(message);
    }
  }

  public liveProgress(message: string) {
    if (this.isInteractive && this.verbosity !== Verbosity.Quiet) {
      this.renderProgress(message);
    }
  }

  public clearProgress() {
    this.eraseProgressLine();
    this.progressMessage = '';
  }

  /**
   * Prints a line such as "✔ 480 analyzed · ↷ 15 skipped · ✖ 5 failed", the counts at 0 are omitted except the
   * succeeded one.
   */
  public summary({ succeeded, label, skipped = 0, failed = 0 }: Summary) {
    const parts = [this.style('green', `✔ ${succeeded} ${label}`)];
    if (skipped > 0) {
      parts.push(this.style('yellow', `↷ ${skipped} skipped`));
    }
    if (failed > 0) {
      parts.push(this.style('red', `✖ ${failed} failed`));
    }
    this.clearProgress();
    this.log(parts.join(' · '));
  }

  public failedDemos(failedDemos: FailedDemo[]) {
    if (failedDemos.length === 0) {
      return;
    }

    const lines = ['Failed demos:'];
    for (const { demoPath, details } of failedDemos) {
      lines.push(`  ${demoPath}`);
      for (const line of details.trimEnd().split('\n')) {
        lines.push(`    ${line}`);
      }
    }
    this.error(lines.join('\n'));
  }

  public table(headers: string[], rows: TableCell[][]) {
    const cells = [
      headers.map((text) => ({ text, style: 'bold' as const })),
      ...rows.map((row) => row.map((cell) => (typeof cell === 'string' ? { text: cell, style: undefined } : cell))),
    ];
    const maxWidth = this.isInteractive ? (this.messageStream.columns || 80) - 1 : undefined;
    const alignedRows = alignColumns(
      cells.map((row) => row.map(({ text }) => text)),
      maxWidth,
    );
    for (const [rowIndex, row] of alignedRows.entries()) {
      const line = row.map((text, columnIndex) => {
        const { style } = cells[rowIndex][columnIndex];
        return style === undefined ? text : this.style(style, text);
      });
      this.print(line.join(''));
    }
  }

  private style(style: Style, text: string, stream: NodeJS.WriteStream = this.messageStream) {
    return styleText(style, text, { stream });
  }

  private writeProgress(text: string) {
    if (this.messageStream === process.stderr) {
      this.writeToStderr(text);
    } else {
      this.writeToStdout(text);
    }
  }

  private renderProgress(message: string) {
    // A message longer than the terminal would wrap and only its last line would be erased.
    const maxLength = (this.messageStream.columns || 80) - 1;
    this.progressMessage = truncate(message, maxLength);
    this.writeProgress(`\r\x1b[2K${this.progressMessage}`);
    this.isProgressDisplayed = true;
  }

  private eraseProgressLine() {
    if (this.isProgressDisplayed) {
      this.writeProgress('\r\x1b[2K');
      this.isProgressDisplayed = false;
    }
  }

  /**
   * Intercepts all the writes, including the ones from the logger, dependencies or Node.js warnings:
   * - The progress message is erased before the write and displayed again below the written lines, the output would
   * otherwise be appended to it.
   * - In JSON mode, stdout writes are redirected to stderr so that stdout contains only the JSON whatever writes to it.
   */
  private interceptWrites(stream: NodeJS.WriteStream) {
    const write = stream.write;
    stream.write = (chunk: string | Uint8Array, ...args: unknown[]) => {
      this.eraseProgressLine();
      const result =
        this.isJsonMode && stream === process.stdout
          ? (Reflect.apply(this.writeToStderr, process.stderr, [chunk, ...args]) as boolean)
          : (Reflect.apply(write, stream, [chunk, ...args]) as boolean);
      // Displayed again only after a complete line, otherwise the next write would continue the progress message.
      const endsWithNewLine = typeof chunk === 'string' ? chunk.endsWith('\n') : chunk.at(-1) === 0x0a;
      if (this.progressMessage !== '' && endsWithNewLine) {
        this.writeProgress(this.progressMessage);
        this.isProgressDisplayed = true;
      }

      return result;
    };
  }
}

export const output = new Output();
