import React, { useState, type FormEvent } from 'react';
import { Trans } from '@lingui/react/macro';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { replaceSequences } from 'csdm/ui/match/video/sequences/sequences-actions';
import { CollapseTransition } from 'csdm/ui/components/transitions/collapse-transition';
import { useCurrentMatchSequences } from 'csdm/ui/match/video/sequences/use-current-match-sequences';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { CancelButton } from 'csdm/ui/components/buttons/cancel-button';
import { FocusCameraPlayerSelect } from 'csdm/ui/match/video/focus-camera-player-select';
import { XRayCheckbox } from 'csdm/ui/match/video/x-ray-checkbox';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';
import { CfgInput } from 'csdm/ui/match/video/cfg-input';
import { SequencePlayersOptions } from './player-options/sequence-players-options';
import { usePlayersOptions } from './player-options/use-players-options';
import { PlayerVoicesCheckbox } from 'csdm/ui/match/video/player-voices-checkbox';
import type { Sequence } from 'csdm/common/types/sequence';
import { ShowOnlyDeathNoticesCheckbox } from 'csdm/ui/match/video/show-only-death-notices-checkbox';
import { useCanEditVideoPlayersOptions } from 'csdm/ui/match/video/use-can-edit-video-players-options';
import { DeathNoticesDurationInput } from '../../death-notices-duration-input';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { ConfirmButton } from 'csdm/ui/components/buttons/confirm-button';

type State = {
  overridePlayerFocusSteamId: boolean;
  overrideDeathNoticesDuration: boolean;
  overridePlayerOptions: boolean;
  overrideCfg: boolean;
};

export function EditSequenceSettingsDialog() {
  const dispatch = useDispatch();
  const { hideDialog } = useDialog();
  const match = useCurrentMatch();
  const sequences = useCurrentMatchSequences();
  const { settings } = useVideoSettings();
  const [playerFocusSteamId, setPlayerFocusSteamId] = useState<string | undefined>(undefined);
  const [showOnlyDeathNotices, setShowOnlyDeathNotices] = useState(true);
  const [showXRay, setShowXRay] = useState(false);
  const [playerVoicesEnabled, setPlayerVoicesEnabled] = useState(true);
  const [cfg, setCfg] = useState<string | undefined>(undefined);
  const { options: playerOptions } = usePlayersOptions();
  const canEditPlayersOptions = useCanEditVideoPlayersOptions();

  const [state, setState] = useState<State>({
    overridePlayerFocusSteamId: false,
    overrideDeathNoticesDuration: false,
    overridePlayerOptions: false,
    overrideCfg: false,
  });

  const onConfirm = (event: FormEvent) => {
    event.preventDefault();
    if (!(event.target instanceof HTMLFormElement)) {
      return;
    }
    const formData = new FormData(event.target);
    const deathNoticesDuration = parseInt(formData.get('death-notices-duration') as string, 10);
    const newSequences = sequences.map<Sequence>((sequence) => {
      const playerName = match.players.find((player) => player.steamId === playerFocusSteamId)?.name ?? '';
      return {
        ...sequence,
        showXRay,
        showOnlyDeathNotices,
        deathNoticesDuration:
          state.overrideDeathNoticesDuration && !isNaN(deathNoticesDuration)
            ? deathNoticesDuration
            : sequence.deathNoticesDuration,
        playerVoicesEnabled,
        cameras:
          state.overridePlayerFocusSteamId && playerFocusSteamId
            ? [{ tick: sequence.startTick, playerSteamId: playerFocusSteamId, playerName }]
            : sequence.cameras,
        cfg: state.overrideCfg ? cfg : sequence.cfg,
        playersOptions: state.overridePlayerOptions ? playerOptions : sequence.playersOptions,
      };
    });
    dispatch(
      replaceSequences({
        demoFilePath: match.demoFilePath,
        sequences: newSequences,
      }),
    );
    hideDialog();
  };

  return (
    <Dialog>
      <DialogHeader>
        <DialogTitle>
          <Trans context="Dialog title">Edit sequences settings</Trans>
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={onConfirm}>
        <DialogContent>
          <div className="flex flex-col gap-y-8 max-h-[500px] overflow-hidden">
            <p>
              <Trans>The following settings will be applied to all existing sequences.</Trans>
            </p>
            <XRayCheckbox defaultChecked={showXRay} onChange={setShowXRay} />
            <ShowOnlyDeathNoticesCheckbox isChecked={showOnlyDeathNotices} onChange={setShowOnlyDeathNotices} />

            {window.csdm.isWindows && (
              <div className="flex flex-col gap-y-4">
                <Checkbox
                  label={<Trans>Override death notices duration</Trans>}
                  isChecked={state.overrideDeathNoticesDuration}
                  onChange={(event) => {
                    setState({ ...state, overrideDeathNoticesDuration: event.target.checked });
                  }}
                />

                <CollapseTransition isVisible={state.overrideDeathNoticesDuration}>
                  <DeathNoticesDurationInput value={settings.deathNoticesDuration} />
                </CollapseTransition>
              </div>
            )}

            <PlayerVoicesCheckbox defaultChecked={playerVoicesEnabled} onChange={setPlayerVoicesEnabled} />

            <div className="flex flex-col gap-y-4">
              <Checkbox
                label={<Trans>Override camera focus</Trans>}
                isChecked={state.overridePlayerFocusSteamId}
                onChange={(event) => {
                  setState({ ...state, overridePlayerFocusSteamId: event.target.checked });
                }}
              />

              <CollapseTransition isVisible={state.overridePlayerFocusSteamId}>
                <div className="ml-16">
                  <FocusCameraPlayerSelect onChange={setPlayerFocusSteamId} playerFocusSteamId={playerFocusSteamId} />
                </div>
              </CollapseTransition>
            </div>

            <div className="flex flex-col gap-y-4">
              <Checkbox
                label={<Trans>Override CFG</Trans>}
                isChecked={state.overrideCfg}
                onChange={(event) => {
                  setState({ ...state, overrideCfg: event.target.checked });
                }}
              />

              <CollapseTransition isVisible={state.overrideCfg}>
                <div className="w-full h-[180px]">
                  <CfgInput
                    cfg={cfg}
                    onBlur={(event) => {
                      setCfg(event.target.value);
                    }}
                  />
                </div>
              </CollapseTransition>
            </div>

            {canEditPlayersOptions && (
              <div className="flex flex-col gap-y-4">
                <Checkbox
                  label={<Trans>Override player options</Trans>}
                  isChecked={state.overridePlayerOptions}
                  onChange={(event) => {
                    setState({ ...state, overridePlayerOptions: event.target.checked });
                  }}
                />

                <CollapseTransition isVisible={state.overridePlayerOptions}>
                  <div className="max-h-[calc(300px-var(--table-row-height)-2px)] overflow-y-auto">
                    <SequencePlayersOptions />
                  </div>
                </CollapseTransition>
              </div>
            )}
          </div>
        </DialogContent>
        <DialogFooter>
          <ConfirmButton type="submit" />
          <CancelButton onClick={hideDialog} />
        </DialogFooter>
      </form>
    </Dialog>
  );
}
