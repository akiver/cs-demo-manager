import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';
import type { Game } from 'csdm/common/types/counter-strike';

export class CounterStrikeAlreadyRunning extends BaseError {
  public game: Game;
  public constructor(game: Game) {
    super(ErrorCode.CounterStrikeAlreadyRunning);
    this.message = 'Counter-Strike is already running';
    this.game = game;
  }
}
