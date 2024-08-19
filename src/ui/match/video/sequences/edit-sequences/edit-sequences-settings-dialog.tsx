import React, { useState } from 'react';
import { Trans } from '@lingui/macro';
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
import { DeathNotices } from './death-notices/death-notices';
import { useDeathNotices } from './death-notices/use-death-notices';

type State = {
  overridePlayerFocusSteamId: boolean;
  overrideDeathNotices: boolean;
  overrideCfg: boolean;
};

export function EditSequenceSettingsDialog() {
  const dispatch = useDispatch();
  const { hideDialog } = useDialog();
  const match = useCurrentMatch();
  const sequences = useCurrentMatchSequences();
  const [playerFocusSteamId, setPlayerFocusSteamId] = useState<string | undefined>(undefined);
  const [showXRay, setShowXRay] = useState(false);
  const [cfg, setCfg] = useState<string | undefined>(undefined);
  const { deathNotices } = useDeathNotices();

  const [state, setState] = useState<State>({
    overridePlayerFocusSteamId: false,
    overrideDeathNotices: false,
    overrideCfg: false,
  });

  const onConfirm = () => {
    const newSequences = sequences.map((sequence) => {
      return {
        ...sequence,
        showXRay,
        playerFocusSteamId: state.overridePlayerFocusSteamId ? playerFocusSteamId : sequence.playerFocusSteamId,
        cfg: state.overrideCfg ? cfg : sequence.cfg,
        deathNotices: state.overrideDeathNotices ? deathNotices : sequence.deathNotices,
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

          {window.csdm.isWindows && (
            <div className="flex flex-col gap-y-4">
              <Checkbox
                label={<Trans>Override death notices</Trans>}
                isChecked={state.overrideDeathNotices}
                onChange={(event) => {
                  setState({ ...state, overrideDeathNotices: event.target.checked });
                }}
              />

              <CollapseTransition isVisible={state.overrideDeathNotices}>
                <div className="max-h-[300px] overflow-y-auto">
                  <DeathNotices />
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
