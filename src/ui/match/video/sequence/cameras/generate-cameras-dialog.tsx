import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { CancelButton } from 'csdm/ui/components/buttons/cancel-button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import type { GenerateCamerasForm } from 'csdm/ui/match/video/sequence/cameras/generate-cameras-form';
import { FocusCameraPlayerSelect } from 'csdm/ui/match/video/focus-camera-player-select';
import { KillFocusCameraPovSelect } from 'csdm/ui/match/video/sequence/cameras/focus-camera-kill-pov-input';
import type { SequenceFormContextState } from '../sequence-form-provider';
import type { CameraFocus } from 'csdm/common/types/camera-focus';
import { WeaponType } from 'csdm/common/types/counter-strike';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';

type Props = {
  sequenceContext: SequenceFormContextState;
};

export function GenerateCamerasDialog({ sequenceContext }: Props) {
  const match = useCurrentMatch();
  const { hideDialog } = useDialog();
  const { sequence, updateSequence } = sequenceContext;
  const [form, setForm] = useState<GenerateCamerasForm>({
    playerFocusSteamId: undefined,
    killCameraPov: undefined,
    beforeKillDelaySeconds: 2,
  });

  const onSubmit = () => {
    const startTick = Number(sequence.startTick);
    const endTick = Number(sequence.endTick);
    const cameras: CameraFocus[] = [];
    if (form.playerFocusSteamId) {
      cameras.push({
        tick: startTick,
        playerSteamId: form.playerFocusSteamId,
        playerName: match.players.find((player) => player.steamId === form.playerFocusSteamId)?.name ?? '',
      });
    }

    if (typeof form.killCameraPov === 'string') {
      const killsInSequence = match.kills.filter((kill) => {
        return kill.tick >= startTick && kill.tick <= endTick;
      });
      if (form.killCameraPov === 'killer') {
        for (const kill of killsInSequence) {
          if (kill.weaponType === WeaponType.World) {
            continue;
          }

          cameras.push({
            tick: Math.round(kill.tick - form.beforeKillDelaySeconds * match.tickrate),
            playerSteamId: kill.killerSteamId,
            playerName: kill.killerName,
          });
        }
      } else {
        for (const kill of killsInSequence) {
          cameras.push({
            tick: Math.round(kill.tick - form.beforeKillDelaySeconds * match.tickrate),
            playerSteamId: kill.victimSteamId,
            playerName: kill.victimName,
          });
        }
      }
    }

    updateSequence({
      cameras,
    });

    hideDialog();
  };

  const { startTick, endTick } = sequence;
  const duration = Math.round((Number(endTick) - Number(startTick)) / match.tickrate);

  return (
    <Dialog>
      <DialogHeader>
        <DialogTitle>
          <Trans context="Dialog title">Generate cameras</Trans>
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        <form id="cameras-form" className="flex flex-col gap-y-24" onSubmit={onSubmit}>
          <div className="flex items-center gap-x-8">
            <ExclamationTriangleIcon className="size-16 text-orange-700" />
            <p>
              <Trans>
                The sequence is from tick <strong>{startTick}</strong> to <strong>{endTick}</strong> (
                <strong>{duration}s</strong>).
              </Trans>
            </p>
          </div>

          <FocusCameraPlayerSelect
            label={<Trans>Focus the camera on the following player when the sequence start</Trans>}
            playerFocusSteamId={form.playerFocusSteamId}
            onChange={(steamId) => {
              setForm({ ...form, playerFocusSteamId: steamId });
            }}
          />

          <KillFocusCameraPovSelect
            pov={form.killCameraPov}
            onPovChange={(pov) => {
              setForm({ ...form, killCameraPov: pov });
            }}
            beforeKillDelaySeconds={form.beforeKillDelaySeconds}
            onBeforeKillDelaySecondsChange={(seconds) => {
              setForm({ ...form, beforeKillDelaySeconds: seconds });
            }}
          />
        </form>
      </DialogContent>
      <DialogFooter>
        <Button type="submit" form="cameras-form" onClick={onSubmit}>
          <Trans context="Button">Generate</Trans>
        </Button>
        <CancelButton onClick={hideDialog} />
      </DialogFooter>
    </Dialog>
  );
}
