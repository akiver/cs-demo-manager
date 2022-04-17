using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Core.Models;
using Core.Models.Events;
using DemoInfo;
using Player = Core.Models.Player;

namespace Services.Concrete.Analyzer
{
    public class ValveAnalyzer : DemoAnalyzer
    {
        /// <summary>
        /// Used to detect forced pauses during a round.
        /// When it happens, all players are killed and the game is paused.
        /// We don't want to pause the game when only one player killed himself (it can happened).
        /// We track hw many suicides happened in a row.
        /// </summary>
        private int _suicideCount;

        private bool _isRoundFinal = false;

        public ValveAnalyzer(Demo demo)
        {
            Parser = new DemoParser(File.OpenRead(demo.Path));
            // Reset to have update on UI
            demo.ResetStats();
            Demo = demo;
            RegisterEvents();
        }

        protected sealed override void RegisterEvents()
        {
            Parser.MatchStarted += HandleMatchStarted;
            Parser.RoundAnnounceMatchStarted += HandleRoundAnnounceMatchStarted;
            Parser.RoundMVP += HandleRoundMvp;
            Parser.PlayerKilled += HandlePlayerKilled;
            Parser.RoundStart += HandleRoundStart;
            Parser.RoundOfficiallyEnd += HandleRoundOfficiallyEnd;
            Parser.BombPlanted += HandleBombPlanted;
            Parser.BombDefused += HandleBombDefused;
            Parser.BombExploded += HandleBombExploded;
            Parser.TickDone += HandleTickDone;
            Parser.WeaponFired += HandleWeaponFired;
            Parser.RoundEnd += HandleRoundEnd;
            Parser.FlashNadeExploded += HandleFlashNadeExploded;
            Parser.ExplosiveNadeExploded += HandleExplosiveNadeExploded;
            Parser.SmokeNadeStarted += HandleSmokeNadeStarted;
            Parser.FireNadeEnded += HandleFireNadeEnded;
            Parser.BotTakeOver += HandleBotTakeOver;
            Parser.LastRoundHalf += HandleLastRoundHalf;
            Parser.SmokeNadeEnded += HandleSmokeNadeEnded;
            Parser.FireNadeStarted += HandleFireNadeStarted;
            Parser.DecoyNadeStarted += HandleDecoyNadeStarted;
            Parser.DecoyNadeEnded += HandleDecoyNadeEnded;
            Parser.PlayerHurt += HandlePlayerHurted;
            Parser.RankUpdate += HandleServerRankUpdate;
            Parser.PlayerDisconnect += HandlePlayerDisconnect;
            Parser.PlayerTeam += HandlePlayerTeam;
            Parser.SayText += HandleSayText;
            Parser.SayText2 += HandleSayText2;
            Parser.FreezetimeEnded += HandleFreezetimeEnded;
            Parser.RoundFinal += HandleRoundFinal;
            Parser.WinPanelMatch += HandleWinPanelMatch;
        }

        public override async Task<Demo> AnalyzeDemoAsync(CancellationToken token, Action<string, float> progressCallback = null)
        {
            ProgressCallback = progressCallback;
            Parser.ParseHeader();

            await Task.Run(() => Parser.ParseToEnd(token), token);

            ProcessAnalyzeEnded();

            return Demo;
        }

        #region Events Handlers

        private void HandleServerRankUpdate(object sender, RankUpdateEventArgs e)
        {
            Player player = Demo.Players.FirstOrDefault(p => p.SteamId == e.SteamId);
            if (player != null)
            {
                player.RankNumberOld = e.RankOld;
                player.RankNumberNew = e.RankNew;
                player.WinCount = e.WinCount;
            }
        }

        private void HandleBotTakeOver(object sender, BotTakeOverEventArgs e)
        {
            if (!IsMatchStarted || e.Taker == null)
            {
                return;
            }

            Player player = Demo.Players.FirstOrDefault(p => p.SteamId == e.Taker.SteamID);
            if (player != null)
            {
                player.IsControllingBot = true;
            }
        }

        protected void HandleLastRoundHalf(object sender, LastRoundHalfEventArgs e)
        {
            if (!IsMatchStarted)
            {
                return;
            }

            IsLastRoundHalf = true;
        }

        private void HandleRoundFinal(object sender, RoundFinalEventArgs roundFinalEventArgs)
        {
            _isRoundFinal = true;
        }

        protected override void HandleMatchStarted(object sender, MatchStartedEventArgs e)
        {
            if (IsMatchStarted)
            {
                Demo.ResetStats(false);
            }

            StartMatch();
        }

        protected void HandleWinPanelMatch(object sender, WinPanelMatchEventArgs e)
        {
            IsMatchStarted = false;
        }

        protected void HandleRoundAnnounceMatchStarted(object sender, RoundAnnounceMatchStartedEventArgs e)
        {
            if (!IsMatchStarted)
            {
                StartMatch();
            }
        }

        protected override void HandleRoundStart(object sender, RoundStartedEventArgs e)
        {
            if (!IsMatchStarted)
            {
                return;
            }

            _suicideCount = 0;
            IsLastRoundHalf = false;
            // Check players count to prevent missing players who was connected after the match started event
            if (Demo.Players.Count < 10)
            {
                // Add all players to our ObservableCollection of PlayerExtended
                foreach (DemoInfo.Player player in Parser.PlayingParticipants)
                {
                    // don't add bot and already known players
                    if (player.SteamID != 0 && Demo.Players.FirstOrDefault(p => p.SteamId == player.SteamID) == null)
                    {
                        Player pl = new Player
                        {
                            SteamId = player.SteamID,
                            Name = player.Name,
                            Side = player.Team.ToSide(),
                        };
                        Demo.Players.Add(pl);
                        pl.TeamName = pl.Side == Side.CounterTerrorist ? Demo.TeamCT.Name : Demo.TeamT.Name;
                    }
                }
            }

            CreateNewRound();
        }

        protected new void HandleRoundEnd(object sender, RoundEndedEventArgs e)
        {
            base.HandleRoundEnd(sender, e);

            if (!IsMatchStarted || IsFreezetime)
            {
                return;
            }

            if (IsLastRoundHalf)
            {
                SwapTeams();
                Demo.Rounds.Add(CurrentRound);
            }

            if (IsOvertime && IsLastRoundHalf)
            {
                IsHalfMatch = false;
            }
        }

        protected new void HandleRoundOfficiallyEnd(object sender, RoundOfficiallyEndedEventArgs e)
        {
            base.HandleRoundOfficiallyEnd(sender, e);

            if (!IsMatchStarted || IsFreezetime)
            {
                return;
            }

            if (_isRoundFinal)
            {
                _isRoundFinal = false;
                if (IsOvertime)
                {
                    Demo.Overtimes.Add(CurrentOvertime);
                    IsHalfMatch = !IsHalfMatch;
                }
                else
                {
                    IsOvertime = true;
                }

                CreateNewOvertime();
            }
        }

        protected new void HandlePlayerKilled(object sender, PlayerKilledEventArgs e)
        {
            if (!IsMatchStarted || IsFreezetime || e.Victim == null)
            {
                return;
            }

            Weapon weapon = Weapon.WeaponList.FirstOrDefault(w => w.Element == e.Weapon.Weapon);
            if (weapon == null)
            {
                return;
            }

            Player killed = Demo.Players.FirstOrDefault(player => player.SteamId == e.Victim.SteamID);
            Player killer = null;

            KillEvent killEvent = new KillEvent(Parser.IngameTick, Parser.CurrentTime)
            {
                KillerSteamId = e.Killer?.SteamID ?? 0,
                KillerName = e.Killer?.Name ?? "World",
                KillerSide = e.Killer?.Team.ToSide() ?? Side.None,
                Weapon = weapon,
                KillerVelocityX = e.Killer?.Velocity.X ?? 0,
                KillerVelocityY = e.Killer?.Velocity.Y ?? 0,
                KillerVelocityZ = e.Killer?.Velocity.Z ?? 0,
                KillerIsBlinded = e.Killer?.FlashDuration > 0,
                KilledSteamId = e.Victim.SteamID,
                KilledName = e.Victim.Name,
                KilledSide = e.Victim.Team.ToSide(),
                VictimIsBlinded = e.Victim.FlashDuration > 0,
                RoundNumber = CurrentRound.Number,
                IsKillerCrouching = e.Killer?.IsDucking ?? false,
                IsHeadshot = e.Headshot,
                Point = new KillHeatmapPoint
                {
                    KillerX = e.Killer?.Position.X ?? 0,
                    KillerY = e.Killer?.Position.Y ?? 0,
                    VictimX = e.Victim.Position.X,
                    VictimY = e.Victim.Position.Y,
                },
                TimeDeathSeconds = (float)Math.Round((Parser.IngameTick - CurrentRound.FreezetimeEndTick) / Demo.ServerTickrate, 2),
            };

            bool killerIsBot = e.Killer != null && e.Killer.SteamID == 0;
            bool victimIsBot = e.Victim.SteamID == 0;
            bool assisterIsBot = e.Assister != null && e.Assister.SteamID == 0;

            if (e.Killer != null)
            {
                killer = Demo.Players.FirstOrDefault(player => player.SteamId == e.Killer.SteamID);
            }

            if (killer != null)
            {
                if (e.Victim.SteamID != killer.SteamId)
                {
                    if (!killer.RoundsMoneyEarned.ContainsKey(CurrentRound.Number))
                    {
                        killer.RoundsMoneyEarned[CurrentRound.Number] = weapon.KillAward;
                    }
                    else
                    {
                        killer.RoundsMoneyEarned[CurrentRound.Number] += weapon.KillAward;
                    }
                }
                else
                {
                    // Player suicide, hack to detect pause forced during a match
                    // Happended during the match SK vs VP on train during Atlanta 2017
                    // All players are killed and the game is paused (freeze time)
                    if (++_suicideCount == 6)
                    {
                        BackupToLastRound();
                    }

                    return;
                }

                killEvent.KillerTeam = killer.TeamName;
                killEvent.KillerIsControllingBot = e.Killer.SteamID != 0 && killer.IsControllingBot;
                ProcessTradeKill(killEvent);
            }

            if (killed != null)
            {
                // suicide, probably because he missed the jump from upper B on train :)
                if (e.Killer == null)
                {
                    killed.SuicideCount++;
                }

                killEvent.KilledIsControllingBot = e.Victim.SteamID != 0 && killed.IsControllingBot;
                killEvent.KilledTeam = killed.TeamName;
                killed.TimeDeathRounds[CurrentRound.Number] = killEvent.TimeDeathSeconds;
            }

            // Human killed human
            if (!killerIsBot && !victimIsBot)
            {
                if (killer != null && killed != null)
                {
                    killed.IsAlive = false;
                    // TK
                    if (e.Killer.Team == e.Victim.Team)
                    {
                        killer.Kills.Add(killEvent);
                        killed.Deaths.Add(killEvent);
                    }
                    else
                    {
                        // Regular kill
                        if (!killer.IsControllingBot)
                        {
                            killer.Kills.Add(killEvent);
                        }

                        if (!killed.IsControllingBot)
                        {
                            killed.Deaths.Add(killEvent);
                        }
                    }
                }
            }

            // Human killed a bot
            if (!killerIsBot && victimIsBot)
            {
                killer?.Kills.Add(killEvent);
            }

            // A bot killed a human
            if (killerIsBot && !victimIsBot)
            {
                // TK or not we add a death to the human
                killed?.Deaths.Add(killEvent);
            }

            // Add assist if there was one
            if (e.Assister != null && !assisterIsBot && e.Assister.Team != e.Victim.Team)
            {
                Player assister = Demo.Players.FirstOrDefault(player => player.SteamId == e.Assister.SteamID);
                if (assister != null)
                {
                    killEvent.AssisterSteamId = e.Assister.SteamID;
                    killEvent.AssisterName = e.Assister.Name;
                    killEvent.AssisterIsControllingBot = e.Assister.SteamID != 0 && assister.IsControllingBot;
                    assister.Assists.Add(killEvent);
                }
            }

            // If the killer isn't a bot we can update individual kill, open and entry kills
            if (e.Killer != null && e.Killer.Team != e.Victim.Team && killer != null && !killer.IsControllingBot)
            {
                if (!KillsThisRound.ContainsKey(e.Killer))
                {
                    KillsThisRound[e.Killer] = 0;
                }

                KillsThisRound[e.Killer]++;

                ProcessOpenAndEntryKills(killEvent);
            }

            ProcessClutches();

            CurrentRound.Kills.Add(killEvent);
            Demo.Kills.Add(killEvent);

            if (AnalyzePlayersPosition)
            {
                PositionPoint positionPoint = new PositionPoint
                {
                    X = e.Victim.Position.X,
                    Y = e.Victim.Position.Y,
                    PlayerSteamId = e.Killer?.SteamID ?? 0,
                    PlayerName = e.Killer?.Name ?? string.Empty,
                    Team = e.Killer?.Team.ToSide() ?? Side.None,
                    Event = killEvent,
                    RoundNumber = CurrentRound.Number,
                };
                Demo.PositionPoints.Add(positionPoint);
            }
        }

        protected new void HandlePlayerTeam(object sender, PlayerTeamEventArgs e)
        {
            if (e.Swapped == null || e.Swapped.SteamID == 0)
            {
                return;
            }

            Player player = Demo.Players.FirstOrDefault(p => p.SteamId == e.Swapped.SteamID);
            if (player == null)
            {
                return;
            }

            player.IsConnected = true;
            player.Side = e.NewTeam.ToSide();
            // add the player to his team if he is not
            if (!Demo.TeamCT.Players.Contains(player) && !Demo.TeamT.Players.Contains(player))
            {
                if (Demo.TeamCT.Players.Count > Demo.TeamT.Players.Count)
                {
                    Demo.TeamT.Players.Add(player);
                }
                else
                {
                    Demo.TeamCT.Players.Add(player);
                }
            }
        }

        #endregion

        #region Process

        private void StartMatch()
        {
            Demo.Rounds.Clear();
            IsMatchStarted = true;

            if (!string.IsNullOrWhiteSpace(Parser.CTClanName))
            {
                Demo.TeamCT.Name = Parser.CTClanName;
            }

            if (!string.IsNullOrWhiteSpace(Parser.TClanName))
            {
                Demo.TeamT.Name = Parser.TClanName;
            }

            Demo.TeamCT.CurrentSide = Side.CounterTerrorist;
            Demo.TeamT.CurrentSide = Side.Terrorist;

            // Add all players to our ObservableCollection of PlayerExtended
            foreach (DemoInfo.Player player in Parser.PlayingParticipants)
            {
                // don't add bot
                if (player.SteamID != 0)
                {
                    Player pl = new Player
                    {
                        SteamId = player.SteamID,
                        Name = player.Name,
                        Side = player.Team.ToSide(),
                    };
                    if (!Demo.Players.Contains(pl))
                    {
                        Demo.Players.Add(pl);
                        if (pl.Side == Side.CounterTerrorist && !Demo.TeamCT.Players.Contains(pl))
                        {
                            Demo.TeamCT.Players.Add(pl);
                            pl.TeamName = Demo.TeamCT.Name;
                        }

                        if (pl.Side == Side.Terrorist && !Demo.TeamT.Players.Contains(pl))
                        {
                            Demo.TeamT.Players.Add(pl);
                            pl.TeamName = Demo.TeamT.Name;
                        }
                    }
                }
            }

            // First round handled here because round_start is raised before begin_new_match
            CreateNewRound();
        }

        #endregion
    }
}
