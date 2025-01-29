import React, { useEffect, useRef, useState } from 'react';
import { Trans } from '@lingui/react/macro';
import type { TeamNumber } from 'csdm/common/types/counter-strike';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { Panel, PanelTitle } from 'csdm/ui/components/panel';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { getColorAtPercentage, hexToRgb } from 'csdm/ui/shared/colors';
import { ExportHtmlElementAsImageButton } from 'csdm/ui/components/buttons/export-html-element-as-image-button';
import { useCssVariableValue } from 'csdm/ui/hooks/use-css-variable-value';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { Status } from 'csdm/common/types/status';
import { Spinner } from 'csdm/ui/components/spinner';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import type { FlashbangMatrixRow } from 'csdm/common/types/flashbang-matrix-row';
import { TeamIndicator } from 'csdm/ui/components/match/team-indicator';

type PlayerInfo = {
  steamId: string;
  name: string;
  teamNumber: TeamNumber;
  rows: FlashbangMatrixRow[];
};

export function PlayersFlashbangMatrix() {
  const client = useWebSocketClient();
  const match = useCurrentMatch();
  const chart = useRef<HTMLDivElement | null>(null);
  const [rows, setRows] = useState<FlashbangMatrixRow[]>([]);
  const startColor = hexToRgb(useCssVariableValue('--gray-100'));
  const endColor = hexToRgb('#095aba');
  const [status, setStatus] = useState<Status>(Status.Loading);

  useEffect(() => {
    const fetchRows = async () => {
      try {
        const result = await client.send({
          name: RendererClientMessageName.FetchMatchFlashbangMatrixRows,
          payload: match.checksum,
        });
        setRows(result);
        setStatus(Status.Success);
      } catch (error) {
        setStatus(Status.Error);
      }
    };

    fetchRows();
  }, [client, match.checksum]);

  let maxDuration = 0;
  const players: PlayerInfo[] = [];
  for (const row of rows) {
    if (row.duration > maxDuration) {
      maxDuration = row.duration;
    }

    if (players.some((player) => player.steamId === row.flasherSteamId)) {
      continue;
    }

    players.push({
      steamId: row.flasherSteamId,
      name: row.flasherName,
      teamNumber: row.flasherTeamSide,
      rows: rows.filter((r) => r.flasherSteamId === row.flasherSteamId),
    });
  }

  const renderPanelContent = () => {
    if (status === Status.Success) {
      return (
        <div className="flex flex-col w-fit" ref={chart}>
          {players.map((flasher) => {
            const flasherName = flasher.name;

            return (
              <div key={flasher.steamId} className="flex">
                <div className="flex items-center gap-x-8">
                  <p className="w-[128px] truncate selectable" title={flasherName}>
                    {flasherName}
                  </p>
                  <TeamIndicator teamNumber={flasher.teamNumber} />
                </div>
                <div className="flex ml-8">
                  {flasher.rows.map(({ flashedSteamId, flashedName, duration }) => {
                    return (
                      <div key={flashedSteamId} className="flex flex-col w-[84px]">
                        <Tooltip
                          content={
                            <Trans>
                              <span className="text-body-strong">{flasherName}</span> flashed{' '}
                              <span className="text-body-strong">{flashedName}</span> around{' '}
                              <span className="text-body-strong">{duration}s</span>
                            </Trans>
                          }
                          delay={0}
                          placement="top"
                        >
                          <div
                            className="flex flex-col p-8 border border-gray-300 text-body-strong text-center hover:scale-110 transition-transform duration-100 selectable"
                            style={{
                              backgroundColor: getColorAtPercentage(
                                startColor,
                                endColor,
                                (duration / maxDuration) * 100,
                              ),
                            }}
                          >
                            {duration}
                          </div>
                        </Tooltip>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div className="flex mt-8">
            <div className="flex w-[152px]" />
            {players.map((player) => {
              return (
                <div key={player.steamId} className="flex flex-col gap-y-4 w-[84px]">
                  <TeamIndicator teamNumber={player.teamNumber} />
                  <p className="overflow-hidden break-words selectable" title={player.name}>
                    {player.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-center pb-8">
        {status === Status.Error ? <ErrorMessage message={<Trans>An error occurred</Trans>} /> : <Spinner size={42} />}
      </div>
    );
  };

  return (
    <Panel
      header={
        <div className="flex items-center gap-x-16">
          <PanelTitle>
            <Trans>Players flashbang matrix</Trans>
          </PanelTitle>
          {status === Status.Success && (
            <ExportHtmlElementAsImageButton
              getElement={() => chart.current}
              fileName={`flashbang-matrix-${Date.now()}`}
            />
          )}
        </div>
      }
    >
      {renderPanelContent()}
    </Panel>
  );
}
