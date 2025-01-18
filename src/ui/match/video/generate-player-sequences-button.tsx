import React, { useId, useState, type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { useCurrentMatch } from '../use-current-match';
import {
  generatePlayerDeathsSequences,
  generatePlayerKillsSequences,
  generatePlayerRoundsSequences,
} from './sequences/sequences-actions';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { CancelButton } from 'csdm/ui/components/buttons/cancel-button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { PlayerSequenceEvent } from './sequences/player-sequence-event';
import { WeaponsFilter } from 'csdm/ui/components/dropdown-filter/weapons-filter';
import { uniqueArray } from 'csdm/common/array/unique-array';
import type { Match } from 'csdm/common/types/match';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';
import type { WeaponName } from 'csdm/common/types/counter-strike';
import { Perspective } from 'csdm/common/types/perspective';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { assertNever } from 'csdm/common/assert-never';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';

type SecondsInputProps = {
  label: ReactNode;
  defaultValue: number;
  onChange: (value: number) => void;
};

function SecondsInput({ label, defaultValue, onChange }: SecondsInputProps) {
  const id = useId();
  const min = 0;
  const max = 30;

  return (
    <div className="flex flex-col gap-y-8">
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <div className="w-[5rem]">
        <InputNumber
          id={id}
          min={min}
          max={max}
          placeholder={String(2)}
          defaultValue={defaultValue}
          onChange={(event) => {
            if (!(event.target instanceof HTMLInputElement)) {
              return;
            }

            const value = Number(event.target.value);
            if (value >= min && value <= max) {
              onChange(value);
            }
          }}
        />
      </div>
    </div>
  );
}

function getVisibleWeapons(event: PlayerSequenceEvent, steamId: string | undefined, match: Match) {
  if (!steamId) {
    return [];
  }

  const key = event === PlayerSequenceEvent.Kills ? 'killerSteamId' : 'victimSteamId';

  return uniqueArray(
    match.kills
      .filter((kill) => {
        return kill[key] === steamId;
      })
      .map((kill) => kill.weaponName),
  );
}

function SelectPlayerDialog() {
  const dispatch = useDispatch();
  const match = useCurrentMatch();
  const { settings } = useVideoSettings();
  const { hideDialog } = useDialog();
  const options: SelectOption[] = match.players.map((player) => {
    return {
      value: player.steamId,
      label: player.name,
    };
  });
  const eventOptions: SelectOption<PlayerSequenceEvent>[] = [
    {
      value: PlayerSequenceEvent.Kills,
      label: <Trans context="Select option">Kill</Trans>,
    },
    {
      value: PlayerSequenceEvent.Deaths,
      label: <Trans context="Select option">Death</Trans>,
    },
    {
      value: PlayerSequenceEvent.Rounds,
      label: <Trans context="Select option">Round</Trans>,
    },
  ];
  const [selectedSteamId, setSelectedSteamId] = useState(options.length > 0 ? options[0].value : undefined);
  const [selectedEvent, setSelectedEvent] = useState<PlayerSequenceEvent>(PlayerSequenceEvent.Kills);
  const visibleWeapons = getVisibleWeapons(selectedEvent, selectedSteamId, match);
  const [selectedWeapons, setSelectedWeapons] = useState<WeaponName[]>(visibleWeapons);
  const [perspective, setPerspective] = useState<Perspective>(Perspective.Player);
  const [startSecondsBeforeEvent, setStartSecondsBeforeEvent] = useState(2);
  const [endSecondsAfterEvent, setEndSecondsAfterEvent] = useState(0);

  const onConfirm = () => {
    if (!selectedSteamId) {
      return;
    }

    switch (selectedEvent) {
      case PlayerSequenceEvent.Deaths:
        dispatch(
          generatePlayerDeathsSequences({
            match,
            perspective,
            steamId: selectedSteamId,
            weapons: selectedWeapons,
            settings,
          }),
        );
        break;
      case PlayerSequenceEvent.Kills:
        dispatch(
          generatePlayerKillsSequences({
            match,
            perspective,
            steamId: selectedSteamId,
            weapons: selectedWeapons,
            settings,
          }),
        );
        break;
      case PlayerSequenceEvent.Rounds:
        dispatch(
          generatePlayerRoundsSequences({
            match,
            steamId: selectedSteamId,
            settings,
          }),
        );
        break;
      default:
        return assertNever(selectedEvent, `Unknown player sequence event: ${selectedEvent}`);
    }

    hideDialog();
  };

  const renderSelectedEventOptions = () => {
    if (selectedEvent === PlayerSequenceEvent.Rounds) {
      return (
        <>
          <SecondsInput
            key="round-start-delay"
            label={<Trans context="Input label">Seconds to start before the round starts</Trans>}
            defaultValue={endSecondsAfterEvent}
            onChange={setStartSecondsBeforeEvent}
          />
          <SecondsInput
            key="round-end-delay"
            label={<Trans context="Input label">Seconds to stop after the round ends</Trans>}
            defaultValue={endSecondsAfterEvent}
            onChange={setEndSecondsAfterEvent}
          />
        </>
      );
    }

    return (
      <>
        <div className="flex flex-col gap-y-8">
          <label htmlFor="pov">
            <Trans context="Select label">POV</Trans>
          </label>
          <div>
            <Select
              id="pov"
              options={[
                {
                  value: Perspective.Player,
                  label: <Trans context="Select option">Player</Trans>,
                },
                {
                  value: Perspective.Enemy,
                  label: <Trans context="Select option">Enemy</Trans>,
                },
              ]}
              value={perspective}
              onChange={setPerspective}
            />
          </div>
        </div>
        <SecondsInput
          label={
            perspective === Perspective.Player ? (
              <Trans context="Input label">Seconds to focus the camera on the killer before each kill</Trans>
            ) : (
              <Trans context="Input label">Seconds to focus the camera on the enemy before each kill</Trans>
            )
          }
          defaultValue={startSecondsBeforeEvent}
          onChange={setStartSecondsBeforeEvent}
        />

        {visibleWeapons.length > 0 ? (
          <WeaponsFilter
            weapons={visibleWeapons}
            selectedWeapons={selectedWeapons}
            hasActiveFilter={selectedWeapons.length > 0 && selectedWeapons.length !== visibleWeapons.length}
            onChange={(weapons) => {
              setSelectedWeapons(weapons);
            }}
          />
        ) : (
          <p>
            <Trans>No action found for this player</Trans>
          </p>
        )}

        <div className="flex items-center gap-x-8">
          <ExclamationTriangleIcon className="size-20 text-orange-700" />
          <p className="text-caption">
            <Trans>
              If 2 actions occurred less than 10 seconds apart or 2 actions are less than 2 seconds apart, a single
              sequence will be generated.
            </Trans>
          </p>
        </div>
      </>
    );
  };

  return (
    <Dialog onEnterPressed={onConfirm}>
      <DialogHeader>
        <DialogTitle>
          <Trans context="Dialog title">Generate player's sequences</Trans>
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="flex flex-col gap-y-12 w-[512px]">
          <div className="flex flex-col gap-y-8">
            <label htmlFor="player">
              <Trans context="Select label">Player</Trans>
            </label>
            <div>
              <Select
                id="player"
                options={options}
                value={selectedSteamId}
                onChange={(steamId) => {
                  setSelectedSteamId(steamId);
                  const selectedWeapons = getVisibleWeapons(selectedEvent, steamId, match);
                  setSelectedWeapons(selectedWeapons);
                }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-y-8">
            <label htmlFor="event">
              <Trans context="Select label">Event</Trans>
            </label>
            <div>
              <Select
                id="event"
                options={eventOptions}
                value={selectedEvent}
                onChange={(event) => {
                  setSelectedEvent(event);
                  const selectedWeapons = getVisibleWeapons(event, selectedSteamId, match);
                  setSelectedWeapons(selectedWeapons);
                  if (event === PlayerSequenceEvent.Rounds) {
                    setStartSecondsBeforeEvent(0);
                    setEndSecondsAfterEvent(0);
                  } else {
                    setStartSecondsBeforeEvent(2);
                    setEndSecondsAfterEvent(0);
                  }
                }}
              />
            </div>
          </div>
          {renderSelectedEventOptions()}
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

export function GeneratePlayerSequencesButton() {
  const { showDialog } = useDialog();

  const onClick = () => {
    showDialog(<SelectPlayerDialog />);
  };

  return (
    <Button onClick={onClick}>
      <Trans context="Button">Generate player's sequences</Trans>
    </Button>
  );
}
