import { GameClientMessageName, type GameVideoSequencePayload } from 'csdm/server/messages/game-client-message-name';
import type { Handler } from 'csdm/server/messages/handler';
import { addVideoSequenceHandler } from './game-process/add-video-sequence-handler';

interface GameMessageHandlers {
  [GameClientMessageName.AddVideoSequence]: Handler<GameVideoSequencePayload>;
}

// Mapping between message names and server handlers sent from the game to the WebSocket server.
export const gameHandlers: GameMessageHandlers = {
  [GameClientMessageName.AddVideoSequence]: addVideoSequenceHandler,
};
