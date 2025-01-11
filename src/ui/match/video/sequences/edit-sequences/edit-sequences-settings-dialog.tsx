import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
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

type State = {
  overridePlayerFocusSteamId: boolean;
  overridePlayerOptions: boolean;
  overrideCfg: boolean;
};

export function EditSequenceSettingsDialog() {
  const dispatch = useDispatch();
  const { hideDialog } = useDialog();
  const match = useCurrentMatch();
  const sequences = useCurrentMatchSequences();
  const [playerFocusSteamId, setPlayerFocusSteamId] = useState<string | undefined>(undefined);
  const [showOnlyDeathNotices, setShowOnlyDeathNotices] = useState(true);
  const [showXRay, setShowXRay] = useState(false);
  const [playerVoicesEnabled, setPlayerVoicesEnabled] = useState(true);
  const [cfg, setCfg] = useState<string | undefined>(undefined);
  const { options: playerOptions } = usePlayersOptions();
  const canEditPlayersOptions = useCanEditVideoPlayersOptions();

  const [state, setState] = useState<State>({
    overridePlayerFocusSteamId: false,
    overridePlayerOptions: false,
    overrideCfg: false,
  });

  const onConfirm = () => {
    const newSequences = sequences.map<Sequence>((sequence) => {
      const playerName = match.players.find((player) => player.steamId === playerFocusSteamId)?.name ?? '';
      return {
        ...sequence,
        showXRay,
        showOnlyDeathNotices,
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
    <Dialog
      onEnterPressed={(event) => {
        if (event.target instanceof HTMLTextAreaElement) {
          return;
        }

        onConfirm();
      }}
    >
      <DialogHeader>
        <DialogTitle>
          <Trans context="Dialog title">Edit sequences settings</Trans>
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="flex flex-col gap-y-8 max-h-[500px] overflow-hidden">
          <p>
            <Trans>The following settings will be applied to all existing sequences.</Trans>
          </p>
          <XRayCheckbox defaultChecked={showXRay} onChange={setShowXRay} />
          <ShowOnlyDeathNoticesCheckbox isChecked={showOnlyDeathNotices} onChange={setShowOnlyDeathNotices} />
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
                <div className="max-h-[300px] overflow-y-auto">
                  <SequencePlayersOptions />
                </div>
              </CollapseTransition>
            </div>
          )}
        </div>
      </DialogContent>
      <DialogFooter>
        <Button onClick={onConfirm} variant={ButtonVariant.Primary}>
          <Trans context="Button">Confirm</Trans>
        </Button>
        <CancelButton onClick={hideDialog} />
      </DialogFooter>
    </Dialog>
  );
}
