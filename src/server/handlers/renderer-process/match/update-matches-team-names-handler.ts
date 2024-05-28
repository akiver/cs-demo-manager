import { updateMatchesTeamNames } from 'csdm/node/database/matches/update-matches-teams-names';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { server } from 'csdm/server/server';
import type { TeamNamesPerChecksum } from 'csdm/node/database/matches/fetch-team-names-per-checksum';
import { abortRendererController, createRendererAbortController } from 'csdm/server/abort-controller';

export type UpdateMatchesTeamNamesPayload = {
  checksums: string[];
  teamNameA: string;
  teamNameB: string;
};

export type MatchesTeamNamesUpdatedPayload = TeamNamesPerChecksum;

export async function updateMatchesTeamNamesHandler({
  checksums,
  teamNameA,
  teamNameB,
}: UpdateMatchesTeamNamesPayload) {
  try {
    const abortController = createRendererAbortController();
    const onProgress = (updatedCount: number) => {
      server.sendMessageToRendererProcess({
        name: RendererServerMessageName.TeamNamesUpdated,
        payload: updatedCount,
      });
    };

    const checksumsUpdated = await updateMatchesTeamNames({
      checksums,
      teamNameA,
      teamNameB,
      onProgress,
      signal: abortController.signal,
    });

    return checksumsUpdated;
  } catch (error) {
    logger.error('Error while updating matches team names');
    logger.error(error);
    const errorCode = getErrorCodeFromError(error);
    throw errorCode;
  } finally {
    abortRendererController();
  }
}
