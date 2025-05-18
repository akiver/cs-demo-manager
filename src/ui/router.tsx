import React from 'react';
import { createHashRouter, createRoutesFromElements, Route } from 'react-router';
import { Root } from 'csdm/ui/bootstrap/root';
import { Downloads } from 'csdm/ui/downloads/downloads';
import { Matches } from 'csdm/ui/matches/matches';
import { Demos } from 'csdm/ui/demos/demos';
import { Analyses } from 'csdm/ui/analyses/analyses';
import { DemoLoader } from 'csdm/ui/demo/demo-loader';
import { PlayerMaps } from 'csdm/ui/player/maps/player-maps';
import { Players } from 'csdm/ui/players/players';
import { Player } from 'csdm/ui/player/player';
import { PinnedPlayer } from 'csdm/ui/player/pinned-player';
import { PlayerOverview } from 'csdm/ui/player/overview/player-overview';
import { PlayerCharts } from 'csdm/ui/player/charts/player-charts';
import { PlayerMatchesTable } from 'csdm/ui/player/matches/player-matches-table';
import { MatchLoader } from 'csdm/ui/match/match-loader';
import { MatchOverview } from 'csdm/ui/match/overview/match-overview';
import { Rounds } from 'csdm/ui/match/rounds/overview/rounds';
import { Round } from 'csdm/ui/match/rounds/round/round';
import { MatchHeatmap } from 'csdm/ui/match/heatmap/match-heatmap';
import { MatchGrenades } from 'csdm/ui/match/grenades/match-grenades';
import { Viewer2DLoader } from 'csdm/ui/match/viewer-2d/viewer-2d-loader';
import { VideoLoader } from 'csdm/ui/match/video/video-loader';
import { ChatMessages } from 'csdm/ui/match/chat-messages/chat-messages';
import { Economy } from 'csdm/ui/match/economy/economy';
import { Weapons } from 'csdm/ui/match/weapons/weapons';
import { LastMatchesLoader as ValveLastMatchesLoader } from 'csdm/ui/downloads/valve/last-matches-loader';
import { PendingDownloads } from 'csdm/ui/downloads/pending/pending-downloads';
import { GrenadesStats } from 'csdm/ui/match/grenades/stats/grenades-stats';
import { GrenadesFinderLoader } from 'csdm/ui/match/grenades/finder/grenades-finder-loader';
import { LastMatches as FaceitLastMatches } from 'csdm/ui/downloads/faceit/last-matches';
import { BanStats } from 'csdm/ui/ban/stats/ban-stats';
import { MatchPlayers } from 'csdm/ui/match/players/match-players';
import { MatchPlayersLoader } from 'csdm/ui/match/players/match-players-loader';
import { Search } from 'csdm/ui/search/search';
import { InitialRouteRedirector } from 'csdm/ui/bootstrap/initial-route-redirector';
import { RoutePath } from 'csdm/ui/routes-paths';
import { PlayerRank } from './player/rank/player-rank';
import { ErrorBoundary } from './error-boundary';
import { OpeningDuelsMapLoader } from 'csdm/ui/match/duels/opening-duels-map/opening-duels-map-loader';
import { MatchDuels } from 'csdm/ui/match/duels/match-duels';
import { OpeningDuelsStats } from 'csdm/ui/match/duels/opening-duels-stats/opening-duels-stats';
import { PlayersDuelsMatrix } from 'csdm/ui/match/duels/players-duels-matrix';
import { Teams } from 'csdm/ui/teams/teams';
import { Team } from 'csdm/ui/team/team';
import { TeamOverview } from 'csdm/ui/team/overview/team-overview';
import { TeamMatchesTable } from './team/matches/team-matches-table';
import { TeamMaps } from './team/maps/team-maps';
import { TeamHeatmap } from './team/heatmap/team-heatmap';
import { Videos } from './videos/videos';
import { FiveEPlayLastMatches } from './downloads/five-eplay/5eplay-last-matches';
import { TeamPerformance } from './team/performance/team-performance';

export const router = createHashRouter(
  createRoutesFromElements(
    <Route path="/" element={<Root />} errorElement={<ErrorBoundary />}>
      <Route path={RoutePath.PinnerPlayer} element={<PinnedPlayer />} />
      <Route path={RoutePath.Matches} element={<Matches />} />
      <Route path={`${RoutePath.Matches}/:checksum`} element={<MatchLoader />}>
        <Route index={true} element={<MatchOverview />} />
        <Route path={RoutePath.MatchRounds}>
          <Route index={true} element={<Rounds />} />
          <Route path=":number" element={<Round />} />
        </Route>
        <Route path={RoutePath.MatchPlayers}>
          <Route index={true} element={<MatchPlayersLoader />} />
          <Route path=":steamId" element={<MatchPlayers />} />
        </Route>
        <Route path={RoutePath.MatchHeatmap} element={<MatchHeatmap />} />
        <Route path={RoutePath.MatchDuels} element={<MatchDuels />}>
          <Route index={true} element={<PlayersDuelsMatrix />} />
          <Route path={RoutePath.MatchOpeningDuelsStats} element={<OpeningDuelsStats />} />
          <Route path={RoutePath.MatchOpeningDuelsMap} element={<OpeningDuelsMapLoader />} />
        </Route>
        <Route path={RoutePath.MatchWeapons} element={<Weapons />} />
        <Route path={RoutePath.MatchGrenades} element={<MatchGrenades />}>
          <Route index={true} element={<GrenadesStats />} />
          <Route path={RoutePath.MatchGrenadesFinder} element={<GrenadesFinderLoader />} />
        </Route>
        <Route path={RoutePath.Match2dViewer}>
          <Route index={true} element={<Viewer2DLoader />} />
          <Route path=":number" element={<Viewer2DLoader />} />
        </Route>
        <Route path={RoutePath.MatchVideo} element={<VideoLoader />} />
        <Route path={RoutePath.MatchChat} element={<ChatMessages />} />
        <Route path={RoutePath.MatchEconomy} element={<Economy />} />
      </Route>
      <Route path={RoutePath.Demos} element={<Demos />} />
      <Route path={`${RoutePath.Demos}/:path`} element={<DemoLoader />} />
      <Route path={RoutePath.Players} element={<Players />} />
      <Route path={`${RoutePath.Players}/:steamId`} element={<Player />}>
        <Route index={true} element={<PlayerOverview />} />
        <Route path={RoutePath.PlayerCharts} element={<PlayerCharts />} />
        <Route path={RoutePath.PlayerMaps} element={<PlayerMaps />} />
        <Route path={RoutePath.PlayerRank} element={<PlayerRank />} />
        <Route path={RoutePath.PlayerMatches} element={<PlayerMatchesTable />} />
      </Route>
      <Route path={RoutePath.Teams} element={<Teams />} />
      <Route path={`${RoutePath.Teams}/:name`} element={<Team />}>
        <Route index={true} element={<TeamOverview />} />
        <Route path={RoutePath.TeamMaps} element={<TeamMaps />} />
        <Route path={RoutePath.TeamHeatmap} element={<TeamHeatmap />} />
        <Route path={RoutePath.TeamPerformance} element={<TeamPerformance />} />
        <Route path={RoutePath.TeamMatches} element={<TeamMatchesTable />} />
      </Route>
      <Route path={RoutePath.Search} element={<Search />} />
      <Route path={RoutePath.Ban} element={<BanStats />} />
      <Route path={RoutePath.Analyses} element={<Analyses />} />
      <Route path={RoutePath.Downloads} element={<Downloads />}>
        <Route index={true} element={<ValveLastMatchesLoader />} />
        <Route path={RoutePath.DownloadsFaceit} element={<FaceitLastMatches />} />
        <Route path={RoutePath.Downloads5EPlay} element={<FiveEPlayLastMatches />} />
        <Route path={RoutePath.DownloadsPending} element={<PendingDownloads />} />
      </Route>
      <Route path={RoutePath.Videos} element={<Videos />} />
      <Route index={true} element={<InitialRouteRedirector />} />
    </Route>,
  ),
);
