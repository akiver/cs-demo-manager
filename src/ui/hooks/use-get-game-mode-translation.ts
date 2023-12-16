import { GameMode } from 'csdm/common/types/counter-strike';
import { msg } from '@lingui/macro';
import { useI18n } from './use-i18n';
import { assertSoftNever } from 'csdm/common/assert-soft-never';

export function useGetGameModeTranslation() {
  const _ = useI18n();

  return (gameMode: GameMode) => {
    switch (gameMode) {
      case GameMode.Premier:
        return _(
          msg({
            context: 'Game mode',
            message: 'Premier',
          }),
        );
      case GameMode.Competitive:
        return _(
          msg({
            context: 'Game mode',
            message: 'Competitive 5v5',
          }),
        );
      case GameMode.Scrimmage5V5:
        return _(
          msg({
            context: 'Game mode',
            message: 'Scrimmage 5v5',
          }),
        );
      case GameMode.Scrimmage2V2:
        return _(
          msg({
            context: 'Game mode',
            message: 'Scrimmage 2v2',
          }),
        );
      case GameMode.Casual:
        return _(
          msg({
            context: 'Game mode',
            message: 'Casual',
          }),
        );
      case GameMode.CoOperative:
        return _(
          msg({
            context: 'Game mode',
            message: 'Co-Operative',
          }),
        );
      case GameMode.CoOperativeMission:
        return _(
          msg({
            context: 'Game mode',
            message: 'Co-Operative Mission',
          }),
        );
      case GameMode.Custom:
        return _(
          msg({
            context: 'Game mode',
            message: 'Custom',
          }),
        );
      case GameMode.Deathmatch:
        return _(
          msg({
            context: 'Game mode',
            message: 'Deathmatch',
          }),
        );
      case GameMode.GunGameBomb:
        return _(
          msg({
            context: 'Game mode',
            message: 'Arms Race Bomb',
          }),
        );
      case GameMode.GunGameProgressive:
        return _(
          msg({
            context: 'Game mode',
            message: 'Arms Race',
          }),
        );
      case GameMode.Skirmish:
        return _(
          msg({
            context: 'Game mode',
            message: 'Skirmish',
          }),
        );
      case GameMode.Survival:
        return _(
          msg({
            context: 'Game mode',
            message: 'Survival',
          }),
        );
      default: {
        return assertSoftNever(
          gameMode,
          _(
            msg({
              context: 'Game mode',
              message: 'Unknown',
            }),
          ),
        );
      }
    }
  };
}
