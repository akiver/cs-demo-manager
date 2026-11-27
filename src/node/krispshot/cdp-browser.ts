import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import { spawn, type ChildProcess } from 'node:child_process';
import WebSocket from 'ws';
import { killProcessTree } from './run-process';

type Pending = { resolve: (value: unknown) => void; reject: (error: Error) => void };
type EvaluateResult = { result: { value: unknown }; exceptionDetails?: { text: string; exception?: { description?: string } } };

export function findBrowserExecutable(customPath: string): string | null {
  const local = process.env.LOCALAPPDATA ?? path.join(os.homedir(), 'AppData', 'Local');
  const candidates = [
    customPath,
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    path.join(local, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];
  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

/** Minimal Chrome DevTools Protocol client: Edge / Chrome headless, used to draw the HUD frames. */
export class CdpBrowser {
  private nextId = 1;
  private readonly pending = new Map<number, Pending>();
  private socket: WebSocket | null = null;

  private constructor(
    private readonly child: ChildProcess,
    private readonly profileFolderPath: string,
  ) {}

  public static async launch(executablePath: string) {
    const profileFolderPath = await fs.mkdtemp(path.join(os.tmpdir(), 'krispshot-hud-'));
    const child = spawn(
      executablePath,
      [
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-extensions',
        '--disable-background-networking',
        '--allow-file-access-from-files',
        '--remote-debugging-port=0',
        `--user-data-dir=${profileFolderPath}`,
        'about:blank',
      ],
      { stdio: 'ignore', windowsHide: true },
    );
    const portFilePath = path.join(profileFolderPath, 'DevToolsActivePort');
    const startedAt = Date.now();
    while (!fs.existsSync(portFilePath) || fs.readFileSync(portFilePath, 'utf8').split('\n').length < 2) {
      if (child.exitCode !== null) {
        throw new Error(`The browser exited at once (${executablePath})`);
      }
      if (Date.now() - startedAt > 20_000) {
        killProcessTree(child.pid);
        throw new Error('The browser did not start within 20 seconds');
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const [port, wsPath] = fs.readFileSync(portFilePath, 'utf8').trim().split('\n');
    const browser = new CdpBrowser(child, profileFolderPath);
    await browser.connect(`ws://127.0.0.1:${port.trim()}${wsPath.trim()}`);

    return browser;
  }

  private connect(url: string) {
    return new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(url, { perMessageDeflate: false, maxPayload: 512 * 1024 * 1024 });
      socket.on('open', () => resolve());
      socket.on('error', (error) => reject(error));
      socket.on('message', (data) => {
        const message = JSON.parse(data.toString()) as { id?: number; result?: unknown; error?: { message: string } };
        if (message.id === undefined) {
          return;
        }
        const pending = this.pending.get(message.id);
        if (!pending) {
          return;
        }
        this.pending.delete(message.id);
        if (message.error) {
          pending.reject(new Error(message.error.message));
        } else {
          pending.resolve(message.result);
        }
      });
      socket.on('close', () => {
        for (const pending of this.pending.values()) {
          pending.reject(new Error('DevTools connection closed'));
        }
        this.pending.clear();
      });
      this.socket = socket;
    });
  }

  private send<T = unknown>(method: string, params: Record<string, unknown> = {}, sessionId?: string): Promise<T> {
    const id = this.nextId++;
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (value: unknown) => void, reject });
      this.socket?.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }

  /** Opens a page and returns a function evaluating JavaScript in it. */
  public async open(url: string) {
    const { targetId } = await this.send<{ targetId: string }>('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await this.send<{ sessionId: string }>('Target.attachToTarget', { targetId, flatten: true });
    await this.send(
      'Emulation.setDeviceMetricsOverride',
      { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false },
      sessionId,
    );
    await this.send('Page.enable', {}, sessionId);
    await this.send('Page.navigate', { url }, sessionId);

    return async <T>(expression: string): Promise<T> => {
      const response = await this.send<EvaluateResult>(
        'Runtime.evaluate',
        { expression, awaitPromise: true, returnByValue: true },
        sessionId,
      );
      if (response.exceptionDetails) {
        throw new Error(
          `HUD page error: ${response.exceptionDetails.exception?.description ?? response.exceptionDetails.text}`,
        );
      }
      return response.result.value as T;
    };
  }

  public async close() {
    try {
      await Promise.race([this.send('Browser.close'), new Promise((resolve) => setTimeout(resolve, 2000))]);
    } catch {
      // ignore
    }
    this.socket?.close();
    killProcessTree(this.child.pid);
    await new Promise((resolve) => setTimeout(resolve, 300));
    await fs.remove(this.profileFolderPath).catch(() => undefined);
  }
}
