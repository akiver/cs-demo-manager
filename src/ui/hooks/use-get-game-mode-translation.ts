import { GameMode } from 'csdm/common/types/counter-strike';
import { msg } from '@lingui/macro';
import { useI18n } from './use-i18n';
import { assertNever } from 'csdm/common/assert-never';

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
      default:
        return assertNever(gameMode, 'Unknown game mode');
    }
  };
}
