import { useLingui } from '@lingui/react/macro';
import { GameMode } from 'csdm/common/types/counter-strike';
import { assertSoftNever } from 'csdm/common/assert-soft-never';

export function useGetGameModeTranslation() {
  const { t } = useLingui();

  return (gameMode: GameMode) => {
    switch (gameMode) {
      case GameMode.Premier:
        return t({
          context: 'Game mode',
          message: 'Premier',
        });
      case GameMode.Competitive:
        return t({
          context: 'Game mode',
          message: 'Competitive 5v5',
        });
      case GameMode.Scrimmage5V5:
        return t({
          context: 'Game mode',
          message: 'Scrimmage 5v5',
        });
      case GameMode.Scrimmage2V2:
        return t({
          context: 'Game mode',
          message: 'Scrimmage 2v2',
        });
      case GameMode.Casual:
        return t({
          context: 'Game mode',
          message: 'Casual',
        });
      case GameMode.CoOperative:
        return t({
          context: 'Game mode',
          message: 'Co-Operative',
        });
      case GameMode.CoOperativeMission:
        return t({
          context: 'Game mode',
          message: 'Co-Operative Mission',
        });
      case GameMode.Custom:
        return t({
          context: 'Game mode',
          message: 'Custom',
        });
      case GameMode.Deathmatch:
        return t({
          context: 'Game mode',
          message: 'Deathmatch',
        });
      case GameMode.GunGameBomb:
        return t({
          context: 'Game mode',
          message: 'Arms Race Bomb',
        });
      case GameMode.GunGameProgressive:
        return t({
          context: 'Game mode',
          message: 'Arms Race',
        });
      case GameMode.Skirmish:
        return t({
          context: 'Game mode',
          message: 'Skirmish',
        });
      case GameMode.Survival:
        return t({
          context: 'Game mode',
          message: 'Survival',
        });
      default: {
        return assertSoftNever(
          gameMode,
          t({
            context: 'Game mode',
            message: 'Unknown',
          }),
        );
      }
    }
  };
}
