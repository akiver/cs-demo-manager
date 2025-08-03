import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { useCurrentMatch } from '../use-current-match';
import {
  generatePlayersDeathsSequences,
  generatePlayersKillsSequences,
  generatePlayersRoundsSequences,
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
import { assertNever } from 'csdm/common/assert-never';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { SecondsInput } from 'csdm/ui/components/inputs/seconds-input';
import { ConfirmButton } from 'csdm/ui/components/buttons/confirm-button';
import { PlayersSelect } from 'csdm/ui/components/inputs/select/players-select';
import { RoundsSelect } from 'csdm/ui/components/inputs/select/rounds-select';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';

function getVisibleWeapons(event: PlayerSequenceEvent, steamIds: string[], match: Match) {
  if (steamIds.length === 0) {
    return [];
  }

  const key = event === PlayerSequenceEvent.Kills ? 'killerSteamId' : 'victimSteamId';

  return uniqueArray(
    match.kills
      .filter((kill) => {
        return steamIds.includes(kill[key]);
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
  const [selectedSteamIds, setSelectedSteamIds] = useState(options.length > 0 ? [options[0].value] : []);
  const [selectedEvent, setSelectedEvent] = useState<PlayerSequenceEvent>(PlayerSequenceEvent.Kills);
  const [selectedRounds, setSelectedRounds] = useState<number[]>([]);
  const visibleWeapons = getVisibleWeapons(selectedEvent, selectedSteamIds, match);
  const [selectedWeapons, setSelectedWeapons] = useState<WeaponName[]>(visibleWeapons);
  const [perspective, setPerspective] = useState<Perspective>(Perspective.Player);
  const [startSecondsBeforeEvent, setStartSecondsBeforeEvent] = useState(2);
  const [endSecondsAfterEvent, setEndSecondsAfterEvent] = useState(2);
  const [preserveExistingSequences, setPreserveExistingSequences] = useState(false);

  const onConfirm = () => {
    if (!selectedSteamIds) {
      return;
    }

    switch (selectedEvent) {
      case PlayerSequenceEvent.Deaths:
        dispatch(
          generatePlayersDeathsSequences({
            match,
            perspective,
            steamIds: selectedSteamIds,
            rounds: selectedRounds,
            weapons: selectedWeapons,
            settings,
            startSecondsBeforeEvent,
            endSecondsAfterEvent,
            preserveExistingSequences,
          }),
        );
        break;
      case PlayerSequenceEvent.Kills:
        dispatch(
          generatePlayersKillsSequences({
            match,
            perspective,
            steamIds: selectedSteamIds,
            rounds: selectedRounds,
            weapons: selectedWeapons,
            settings,
            startSecondsBeforeEvent,
            endSecondsAfterEvent,
            preserveExistingSequences,
          }),
        );
        break;
      case PlayerSequenceEvent.Rounds:
        dispatch(
          generatePlayersRoundsSequences({
            match,
            steamIds: selectedSteamIds,
            rounds: selectedRounds,
            settings,
            startSecondsBeforeEvent,
            endSecondsAfterEvent,
            preserveExistingSequences,
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
            label={<Trans context="Input label">Seconds before the round starts to start the sequence</Trans>}
            defaultValue={startSecondsBeforeEvent}
            onChange={setStartSecondsBeforeEvent}
          />
          <SecondsInput
            key="round-end-delay"
            label={
              <Trans context="Input label">Seconds after the round ends or the player dies to stop the sequence</Trans>
            }
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
          label={<Trans context="Input label">Seconds before each kill to start the sequence</Trans>}
          defaultValue={startSecondsBeforeEvent}
          onChange={setStartSecondsBeforeEvent}
        />
        <SecondsInput
          label={<Trans context="Input label">Seconds after each kill to stop the sequence</Trans>}
          defaultValue={endSecondsAfterEvent}
          onChange={setEndSecondsAfterEvent}
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

        <Checkbox
          label={<Trans context="Checkbox label">Preserve existing sequences</Trans>}
          isChecked={preserveExistingSequences}
          onChange={(event) => {
            setPreserveExistingSequences(event.target.checked);
          }}
        />

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
          <PlayersSelect
            players={match.players}
            selectedSteamIds={selectedSteamIds}
            onChange={(steamIds: string[]) => {
              setSelectedSteamIds(steamIds);
              const selectedWeapons = getVisibleWeapons(selectedEvent, steamIds, match);
              setSelectedWeapons(selectedWeapons);
            }}
          />

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
                  const selectedWeapons = getVisibleWeapons(event, selectedSteamIds, match);
                  setSelectedWeapons(selectedWeapons);
                  if (event === PlayerSequenceEvent.Rounds) {
                    setStartSecondsBeforeEvent(0);
                    setEndSecondsAfterEvent(2);
                  } else {
                    setStartSecondsBeforeEvent(2);
                    setEndSecondsAfterEvent(2);
                  }
                }}
              />
            </div>
          </div>
          <RoundsSelect rounds={match.rounds} selectedRoundNumbers={selectedRounds} onChange={setSelectedRounds} />
          {renderSelectedEventOptions()}
        </div>
      </DialogContent>
      <DialogFooter>
        <ConfirmButton onClick={onConfirm} />
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
