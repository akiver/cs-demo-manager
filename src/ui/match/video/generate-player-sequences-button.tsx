import React, { useState } from 'react';
import { Trans } from '@lingui/macro';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { useCurrentMatch } from '../use-current-match';
import { generatePlayerSequences } from './sequences/sequences-actions';
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

function getVisibleWeapons(steamId: string | undefined, match: Match) {
  const weapons = uniqueArray(
    match.kills
      .filter((kill) => {
        return kill.killerSteamId === steamId;
      })
      .map((kill) => kill.weaponName),
  );

  return uniqueArray(weapons);
}

function SelectPlayerDialog() {
  const dispatch = useDispatch();
  const match = useCurrentMatch();
  const { hideDialog } = useDialog();
  const options: SelectOption[] = match.players.map((player) => {
    return {
      value: player.steamId,
      label: player.name,
    };
  });

  const [selectedSteamId, setSelectedSteamId] = useState(options.length > 0 ? options[0].value : undefined);
  const [selectedEvent, setSelectedEvent] = useState<PlayerSequenceEvent>(PlayerSequenceEvent.Kills);
  const visibleWeapons = getVisibleWeapons(selectedSteamId, match);
  const [selectedWeapons, setSelectedWeapons] = useState<WeaponName[]>(visibleWeapons);

  const onConfirm = () => {
    if (selectedSteamId) {
      dispatch(
        generatePlayerSequences({
          steamId: selectedSteamId,
          match,
          event: selectedEvent,
          weapons: selectedWeapons,
        }),
      );
    }
    hideDialog();
  };

  const renderSelectedEventOptions = () => {
    if (selectedEvent !== PlayerSequenceEvent.Kills) {
      return null;
    }

    return (
      <>
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
            <Trans>This player has no kills.</Trans>
          </p>
        )}

        <div className="flex items-center gap-x-8">
          <ExclamationTriangleIcon className="size-20 text-orange-700" />
          <p className="text-caption">
            <Trans>
              If 2 kills are less than 10 seconds apart or 2 sequences are less than 2 seconds apart, a single sequence
              will be generated.
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
        <div className="flex flex-col gap-y-12 max-w-[512px]">
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
                  const selectedWeapons = getVisibleWeapons(steamId, match);
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
                options={[
                  {
                    value: PlayerSequenceEvent.Kills,
                    label: <Trans context="Select option">Kill</Trans>,
                  },
                  {
                    value: PlayerSequenceEvent.Rounds,
                    label: <Trans context="Select option">Round</Trans>,
                  },
                ]}
                value={selectedEvent}
                onChange={(event) => {
                  setSelectedEvent(event);
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
