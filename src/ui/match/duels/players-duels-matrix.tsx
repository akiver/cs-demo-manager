import React, { useEffect, useRef, useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { TeamNumber } from 'csdm/common/types/counter-strike';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { Panel } from 'csdm/ui/components/panel';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { getColorAtPercentage, hexToRgb } from 'csdm/ui/shared/colors';
import { ExportHtmlElementAsImageButton } from 'csdm/ui/components/buttons/export-html-element-as-image-button';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { Status } from 'csdm/common/types/status';
import { Spinner } from 'csdm/ui/components/spinner';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import type { DuelMatrixRow } from 'csdm/common/types/duel-matrix-row';
import { Content } from 'csdm/ui/components/content';
import { TeamIndicator } from 'csdm/ui/components/match/team-indicator';
import { Message } from 'csdm/ui/components/message';

type CellTooltipProps = {
  killerName: string;
  victimName: string;
  killCount: number;
};

function CellTooltip({ killerName, victimName, killCount }: CellTooltipProps) {
  return (
    <p>
      <Trans>
        <span className="text-body-strong">{killerName}</span> killed{' '}
        <span className="text-body-strong">{victimName}</span> <span className="text-body-strong">{killCount}</span>{' '}
        times
      </Trans>
    </p>
  );
}

type CellProps = {
  killerName: string;
  victimName: string;
  killCount: number;
  backgroundColor: string;
};

function Cell({ killCount, backgroundColor, killerName, victimName }: CellProps) {
  return (
    <Tooltip
      content={<CellTooltip killerName={killerName} victimName={victimName} killCount={killCount} />}
      delay={0}
      placement="top"
      renderInPortal={true}
    >
      <div
        className="flex items-center justify-center rounded-full size-40 selectable hover:scale-110 transition-transform duration-100"
        style={{ backgroundColor }}
      >
        <span className="text-subtitle text-white">{killCount}</span>
      </div>
    </Tooltip>
  );
}

type PlayerInfo = {
  steamId: string;
  name: string;
  teamNumber: TeamNumber;
  rows: DuelMatrixRow[];
};

export function PlayersDuelsMatrix() {
  const client = useWebSocketClient();
  const match = useCurrentMatch();
  const chart = useRef<HTMLDivElement | null>(null);
  const [rows, setRows] = useState<DuelMatrixRow[]>([]);
  const startColor = hexToRgb('#991b1b');
  const endColor = hexToRgb('#166534');
  const [status, setStatus] = useState<Status>(Status.Loading);

  useEffect(() => {
    const fetchRows = async () => {
      try {
        const result = await client.send({
          name: RendererClientMessageName.FetchMatchDuelsMatrixRows,
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

  const playersTeamCt: PlayerInfo[] = [];
  const playersTeamT: PlayerInfo[] = [];
  for (const row of rows) {
    const players = row.killerTeamSide === TeamNumber.CT ? playersTeamCt : playersTeamT;
    if (players.some((player) => player.steamId === row.killerSteamId)) {
      continue;
    }

    players.push({
      steamId: row.killerSteamId,
      name: row.killerName,
      teamNumber: row.killerTeamSide,
      rows: rows.filter(({ killerSteamId }) => killerSteamId === row.killerSteamId),
    });
  }
  const hasKills = playersTeamCt.length > 0 && playersTeamT.length > 0;

  const renderPanelContent = () => {
    if (status === Status.Success) {
      if (!hasKills) {
        return (
          <div className="pb-8">
            <Message message={<Trans>No kills found between both teams.</Trans>} />
          </div>
        );
      }

      return (
        <div className="flex flex-col w-fit" ref={chart}>
          <div className="flex mb-8">
            <div className="flex w-[172px]" />

            {playersTeamT.map((player) => {
              return (
                <div key={player.steamId} className="flex flex-col gap-y-4 w-[104px]">
                  <p className="overflow-hidden truncate selectable" title={player.name}>
                    {player.name}
                  </p>
                  <TeamIndicator teamNumber={player.teamNumber} />
                </div>
              );
            })}
          </div>
          {playersTeamCt.map((player) => {
            return (
              <div key={player.steamId} className="flex">
                <div className="flex items-center gap-x-8">
                  <p className="w-[148px] truncate selectable" title={player.name}>
                    {player.name}
                  </p>
                  <TeamIndicator teamNumber={player.teamNumber} />
                </div>
                <div className="flex h-[84px] ml-8">
                  {player.rows.map(({ victimSteamId, victimName, killCount, deathCount }) => {
                    const hasData = killCount > 0 || deathCount > 0;
                    const winRatePercent = (killCount / (killCount + deathCount)) * 100;
                    const killerColor = hasData
                      ? getColorAtPercentage(startColor, endColor, winRatePercent)
                      : 'transparent';
                    const victimColor = hasData
                      ? getColorAtPercentage(startColor, endColor, 100 - winRatePercent)
                      : 'transparent';

                    return (
                      <div key={victimSteamId} className="flex flex-col h-full w-[104px] border border-gray-300">
                        {hasData ? (
                          <div className="relative flex size-full bg-[linear-gradient(45deg,var(--gray-75)_50%,var(--gray-200)_50%)]">
                            <div className="absolute left-12 bottom-8">
                              <Cell
                                killCount={killCount}
                                backgroundColor={killerColor}
                                killerName={player.name}
                                victimName={victimName}
                              />
                            </div>
                            <div className="absolute right-12 top-8">
                              <Cell
                                killCount={deathCount}
                                backgroundColor={victimColor}
                                killerName={victimName}
                                victimName={player.name}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="flex items-center justify-center text-subtitle h-full">-</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
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
    <Content>
      <div>
        <Panel
          header={
            <div>
              {status === Status.Success && hasKills && (
                <ExportHtmlElementAsImageButton
                  getElement={() => chart.current}
                  fileName={`duels-matrix-${Date.now()}`}
                />
              )}
            </div>
          }
        >
          {renderPanelContent()}
        </Panel>
      </div>
    </Content>
  );
}
