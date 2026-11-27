import React, { useEffect, useState } from 'react';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/messages/renderer-client-message-name';
import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { Switch } from 'csdm/ui/components/inputs/switch';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import {
  KrispShotWorkerState,
  type KrispShotSettings as Settings,
  type KrispShotState,
} from 'csdm/common/types/krispshot';

const STATE_LABEL: Record<KrispShotWorkerState, string> = {
  [KrispShotWorkerState.Disabled]: 'Off',
  [KrispShotWorkerState.NotConfigured]: 'Not set up',
  [KrispShotWorkerState.Idle]: 'Online · waiting for clips',
  [KrispShotWorkerState.Working]: 'Making a clip',
  [KrispShotWorkerState.Offline]: 'Website unreachable',
};

const STATE_COLOR: Record<KrispShotWorkerState, string> = {
  [KrispShotWorkerState.Disabled]: 'bg-gray-500',
  [KrispShotWorkerState.NotConfigured]: 'bg-orange-500',
  [KrispShotWorkerState.Idle]: 'bg-green-500',
  [KrispShotWorkerState.Working]: 'bg-blue-500',
  [KrispShotWorkerState.Offline]: 'bg-red-500',
};

/**
 * Settings → KrispShot: connects this app to krispshot.in and turns on the clip worker.
 * Premium players queue clips on the website; this PC records them one at a time with the video queue and
 * uploads them (see src/server/krispshot/krispshot-worker.ts).
 */
export function KrispShotSettings() {
  const client = useWebSocketClient();
  const showToast = useShowToast();
  const [state, setState] = useState<KrispShotState | null>(null);
  const [form, setForm] = useState<Settings | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    void (async () => {
      const initialState = (await client.send({ name: RendererClientMessageName.GetKrispShotState })) as KrispShotState;
      if (isMounted) {
        setState(initialState);
        setForm(initialState.settings);
      }
    })();
    const onStatusChanged = (newState: KrispShotState) => {
      setState(newState);
    };
    client.on(ServerPushMessageName.KrispShotStatusChanged, onStatusChanged);

    return () => {
      isMounted = false;
      client.off(ServerPushMessageName.KrispShotStatusChanged, onStatusChanged);
    };
  }, [client]);

  if (!state || !form) {
    return <p>Loading…</p>;
  }

  const save = async (patch: Partial<Settings>) => {
    setIsBusy(true);
    try {
      const newState = (await client.send({
        name: RendererClientMessageName.UpdateKrispShotSettings,
        payload: patch,
      })) as KrispShotState;
      setState(newState);
      setForm(newState.settings);
      showToast({ id: 'krispshot-settings', content: 'KrispShot settings saved', type: 'success' });
    } catch {
      showToast({ id: 'krispshot-settings', content: 'Could not save the KrispShot settings', type: 'error' });
    } finally {
      setIsBusy(false);
    }
  };

  const testConnection = async () => {
    setIsBusy(true);
    setTestResult('Testing…');
    try {
      const result = (await client.send({
        name: RendererClientMessageName.TestKrispShotConnection,
        payload: form,
      })) as string;
      setTestResult(result);
    } finally {
      setIsBusy(false);
    }
  };

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setForm({ ...form, [key]: value });
  };
  const isDirty = JSON.stringify(form) !== JSON.stringify(state.settings);
  const { status } = state;
  const job = status.currentJob;

  return (
    <div className="flex flex-col gap-y-12">
      <div>
        <p className="text-subtitle">KrispShot clips</p>
        <p className="mt-4">
          Premium players queue clips on krispshot.in. With the worker on, this PC records them one at a time with the
          video queue (HLAE, game audio), adds the KrispShot HUD and uploads them. Keep CS2 closed while it works.
        </p>
      </div>

      <div className="flex flex-col gap-y-8 rounded-8 border border-gray-300 p-12">
        <div className="flex items-center gap-x-8">
          <span className={`size-10 rounded-full ${STATE_COLOR[status.state]}`} />
          <p className="text-body-strong">{STATE_LABEL[status.state]}</p>
          <p className="text-gray-700">{status.message}</p>
        </div>
        {job && (
          <div className="flex flex-col gap-y-4">
            <p>
              {job.playerName} · {job.map} · round {job.rounds.join(', ')} · {job.killCount} kill(s)
            </p>
            <div className="h-8 w-full overflow-hidden rounded-8 bg-gray-200">
              <div className="h-full bg-blue-700 transition-all" style={{ width: `${job.progress}%` }} />
            </div>
            <p className="text-caption">
              {job.progress}% · {job.message}
            </p>
          </div>
        )}
        <p className="text-caption">
          Done: {status.completedCount} · Failed: {status.failedCount}
          {status.lastJob ? ` · Last: ${status.lastJob.ok ? '✔' : '✖'} ${status.lastJob.message.split('\n')[0]}` : ''}
        </p>
      </div>

      <SettingsEntry
        title="Clip worker"
        description="Turn on to take clip jobs from the website. The app keeps working in the background when its window is closed."
        interactiveComponent={
          <Switch
            isChecked={state.settings.enabled}
            onChange={(isChecked) => {
              void save({ ...form, enabled: isChecked });
            }}
          />
        }
      />

      <div className="flex max-w-[600px] flex-col gap-y-8">
        <TextInput
          label="Website address"
          value={form.siteUrl}
          placeholder="https://krispshot.in"
          onChange={(event) => update('siteUrl', event.target.value)}
        />
        <TextInput
          label="Recorder key (website: Admin → Clips)"
          type="password"
          value={form.workerKey}
          placeholder="Recorder key"
          onChange={(event) => update('workerKey', event.target.value)}
        />
        <TextInput
          label="Name shown on the website"
          value={form.workerName}
          onChange={(event) => update('workerName', event.target.value)}
        />
        <TextInput
          label="Demo source used for the analysis (KrispShot servers: matchzy)"
          value={form.demoSource}
          onChange={(event) => update('demoSource', event.target.value)}
        />
        <TextInput
          label="Edge / Chrome for the HUD (empty = find it)"
          value={form.browserPath}
          placeholder="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
          onChange={(event) => update('browserPath', event.target.value)}
        />
        <TextInput
          label="Work folder for demos and recordings (empty = automatic, no ' or ; in the path)"
          value={form.workFolder}
          placeholder="C:\KrispShot"
          onChange={(event) => update('workFolder', event.target.value)}
        />
        <TextInput
          label="Demos kept on disk"
          value={String(form.demoCacheSize)}
          onChange={(event) => update('demoCacheSize', Number(event.target.value) || 1)}
        />
        <div className="flex items-center gap-x-8">
          <Switch isChecked={form.keepFiles} onChange={(isChecked) => update('keepFiles', isChecked)} />
          <p>Keep each clip&apos;s working files after upload (for debugging)</p>
        </div>
        <div className="flex items-center gap-x-8">
          <Button variant={ButtonVariant.Primary} isDisabled={isBusy || !isDirty} onClick={() => save(form)}>
            Save
          </Button>
          <Button isDisabled={isBusy} onClick={testConnection}>
            Test connection
          </Button>
        </div>
        {testResult && <p className="selectable">{testResult}</p>}
      </div>

      <div>
        <p className="mb-8 text-body-strong">Log</p>
        <pre className="selectable max-h-[300px] overflow-y-auto rounded-8 bg-gray-100 p-8 text-caption whitespace-pre-wrap">
          {status.log.length > 0 ? [...status.log].reverse().join('\n') : 'Nothing yet'}
        </pre>
      </div>
    </div>
  );
}
