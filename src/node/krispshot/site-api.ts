import fs from 'fs-extra';
import { Readable } from 'node:stream';
import type { KrispShotClipJob, KrispShotJobStatus, KrispShotSettings } from 'csdm/common/types/krispshot';
import pkg from '../../../package.json' with { type: 'json' };

export class SiteApiError extends Error {
  public constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

/** The krispshot.in clip worker API: /api/clips/worker/* with the recorder key from Admin → Clips. */
export class SiteApi {
  private readonly base: string;
  private readonly headers: Record<string, string>;

  public constructor(settings: KrispShotSettings) {
    this.base = settings.siteUrl;
    this.headers = { Authorization: `Bearer ${settings.workerKey}`, 'X-Clip-Worker': settings.workerName };
  }

  private async postJson<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.base}${path}`, {
      method: 'POST',
      headers: { ...this.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
      signal: AbortSignal.timeout(30_000),
    });
    const text = await response.text();
    let data: { error?: string } | null = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      // not JSON
    }
    if (!response.ok) {
      const reason = data?.error ?? text.slice(0, 200);
      throw new SiteApiError(`${path}: HTTP ${response.status} ${reason}`, response.status);
    }

    return data as T;
  }

  private info() {
    return `KrispShot Demo Manager ${pkg.version}`;
  }

  public claim() {
    return this.postJson<{ job: KrispShotClipJob | null }>('/api/clips/worker/claim', {
      version: pkg.version,
      info: this.info(),
    });
  }

  public ping() {
    return this.postJson<{ ok: boolean }>('/api/clips/worker/claim', {
      version: pkg.version,
      info: this.info(),
      peek: true,
    });
  }

  public progress(id: string, status: KrispShotJobStatus, progress: number, message: string) {
    return this.postJson<{ cancel?: boolean }>(`/api/clips/worker/${id}`, { action: 'progress', status, progress, message });
  }

  public complete(id: string, durationSec: number) {
    return this.postJson<{ ok: boolean }>(`/api/clips/worker/${id}`, { action: 'complete', durationSec });
  }

  public fail(id: string, error: string, retryable: boolean) {
    return this.postJson<{ result: string }>(`/api/clips/worker/${id}`, { action: 'fail', error, retryable });
  }

  public async upload(id: string, kind: 'video' | 'thumb', filePath: string) {
    const { size } = await fs.stat(filePath);
    // duplex is required by Node's fetch for a stream body (missing from some RequestInit typings).
    const init: RequestInit & { duplex: 'half' } = {
      method: 'PUT',
      headers: {
        ...this.headers,
        'Content-Type': kind === 'video' ? 'video/mp4' : 'image/jpeg',
        'Content-Length': String(size),
      },
      body: Readable.toWeb(fs.createReadStream(filePath)) as ReadableStream,
      duplex: 'half',
      signal: AbortSignal.timeout(30 * 60_000),
    };
    const response = await fetch(`${this.base}/api/clips/worker/${id}/upload?kind=${kind}`, init);
    const text = await response.text();
    if (!response.ok) {
      throw new SiteApiError(`upload ${kind}: HTTP ${response.status} ${text.slice(0, 300)}`, response.status);
    }
  }
}
