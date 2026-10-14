import { styleText } from 'node:util';
import { truncate } from './format';

type Style = Parameters<typeof styleText>[0];

type FailedDemo = {
  demoPath: string;
  // Details such as the analyzer output, printed at the end to not interleave long outputs with the progress.
  details: string;
};

type Summary = {
  succeeded: number;
  // Describes the succeeded items, e.g. "analyzed".
  label: string;
  skipped?: number;
  failed?: number;
};

class Output {
  private readonly isInteractive =
    process.stdout.isTTY === true && process.env.CI === undefined && process.env.TERM !== 'dumb';
  private progressMessage = '';
  private isProgressDisplayed = false;
  private readonly writeToStdout = process.stdout.write.bind(process.stdout);

  public constructor() {
    if (this.isInteractive) {
      this.eraseProgressBeforeWrites(process.stdout);
      this.eraseProgressBeforeWrites(process.stderr);
    }
    // Otherwise the shell prompt would be displayed after the progress message when the process exits.
    process.on('exit', () => {
      this.clearProgress();
    });
  }

  public log(message: string) {
    console.log(message);
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
    if (this.isInteractive) {
      this.renderProgress(message);
    } else {
      console.log(message);
    }
  }

  public liveProgress(message: string) {
    if (this.isInteractive) {
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

  private style(style: Style, text: string, stream: NodeJS.WriteStream = process.stdout) {
    return styleText(style, text, { stream });
  }

  private renderProgress(message: string) {
    // A message longer than the terminal would wrap and only its last line would be erased.
    const maxLength = (process.stdout.columns || 80) - 1;
    this.progressMessage = truncate(message, maxLength);
    this.writeToStdout(`\r\x1b[2K${this.progressMessage}`);
    this.isProgressDisplayed = true;
  }

  private eraseProgressLine() {
    if (this.isProgressDisplayed) {
      this.writeToStdout('\r\x1b[2K');
      this.isProgressDisplayed = false;
    }
  }

  /**
   * Any output, including the logger or Node.js warnings, would otherwise be appended to the progress message.
   * The progress message is erased before the write and displayed again below the written lines.
   */
  private eraseProgressBeforeWrites(stream: NodeJS.WriteStream) {
    const write = stream.write;
    stream.write = (chunk: string | Uint8Array, ...args: unknown[]) => {
      this.eraseProgressLine();
      const result = Reflect.apply(write, stream, [chunk, ...args]) as boolean;
      // Displayed again only after a complete line, otherwise the next write would continue the progress message.
      const endsWithNewLine = typeof chunk === 'string' ? chunk.endsWith('\n') : chunk.at(-1) === 0x0a;
      if (this.progressMessage !== '' && endsWithNewLine) {
        this.writeToStdout(this.progressMessage);
        this.isProgressDisplayed = true;
      }

      return result;
    };
  }
}

export const output = new Output();
