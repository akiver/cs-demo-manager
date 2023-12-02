import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';
import type { Game } from 'csdm/common/types/counter-strike';

export class CounterStrikeExecutableNotFound extends BaseError {
  public game: Game;
  public constructor(game: Game) {
    super(ErrorCode.CounterStrikeExecutableNotFound);
    this.message = 'CS executable not found';
    this.game = game;
  }
}
