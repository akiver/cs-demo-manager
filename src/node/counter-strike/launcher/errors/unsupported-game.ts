import type { Game } from 'csdm/common/types/counter-strike';
import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class UnsupportedGame extends BaseError {
  public game: Game;
  public constructor(game: Game) {
    super(ErrorCode.UnsupportedGame);
    this.message = `${game} is not supported on this platform`;
    this.game = game;
  }
}
