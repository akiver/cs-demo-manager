using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using Core.Models;
using Core.Models.Events;
using DemoInfo;
using Player = Core.Models.Player;

namespace Services.Concrete.Analyzer
{
	public class ValveAnalyzer : DemoAnalyzer
	{
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
			Parser.WinPanelMatch += HandleWinPanelMatch;
			Parser.SmokeNadeEnded += HandleSmokeNadeEnded;
			Parser.FireNadeStarted += HandleFireNadeStarted;
			Parser.DecoyNadeStarted += HandleDecoyNadeStarted;
			Parser.DecoyNadeEnded += HandleDecoyNadeEnded;
			Parser.PlayerHurt += HandlePlayerHurted;
			Parser.RankUpdate += HandleServerRankUpdate;
			Parser.PlayerDisconnect += HandlePlayerDisconnect;
			Parser.PlayerTeam += HandlePlayerTeam;
		}

		public override async Task<Demo> AnalyzeDemoAsync(CancellationToken token)
		{
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
			if (!IsMatchStarted) return;
			Player player = Demo.Players.FirstOrDefault(p => p.SteamId == e.Taker.SteamID);
			if (player != null) player.IsControllingBot = true;
		}

		protected void HandleLastRoundHalf(object sender, LastRoundHalfEventArgs e)
		{
			if (!IsMatchStarted) return;
			IsLastRoundHalf = true;
		}

		protected override void HandleMatchStarted(object sender, MatchStartedEventArgs e)
		{
			if (IsMatchStarted) Demo.ResetStats(false);
			StartMatch();
		}

		protected void HandleRoundAnnounceMatchStarted(object sender, RoundAnnounceMatchStartedEventArgs e)
		{
			if (!IsMatchStarted) StartMatch();
		}

		protected override void HandleRoundStart(object sender, RoundStartedEventArgs e)
		{
			if (!IsMatchStarted) return;
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
							Side = player.Team.ToSide()
						};
						Application.Current.Dispatcher.Invoke(delegate
						{
							Demo.Players.Add(pl);
							pl.TeamName = pl.Side == Side.CounterTerrorist ? Demo.TeamCT.Name : Demo.TeamT.Name;
						});
					}
				}
			}
			CreateNewRound();
		}

		protected new void HandleRoundEnd(object sender, RoundEndedEventArgs e)
		{
			base.HandleRoundEnd(sender, e);

			if (IsLastRoundHalf)
			{
				IsSwapTeamRequired = true;
				Application.Current.Dispatcher.Invoke(() => Demo.Rounds.Add(CurrentRound));
			}

			if (IsOvertime && IsLastRoundHalf) IsHalfMatch = false;
		}

		protected void HandleWinPanelMatch(object sender, WinPanelMatchEventArgs e)
		{
			if (!IsMatchStarted) return;

			if (IsOvertime)
			{
				Application.Current.Dispatcher.Invoke(() => Demo.Overtimes.Add(CurrentOvertime));
			}
		}

		protected new void HandleRoundOfficiallyEnd(object sender, RoundOfficiallyEndedEventArgs e)
		{
			base.HandleRoundOfficiallyEnd(sender, e);

			if (!IsMatchStarted) return;

			if (Parser.CTScore == 15 && Parser.TScore == 15)
			{
				IsOvertime = true;
				CurrentOvertime = new Overtime()
				{
					Number = ++OvertimeCount
				};
			}
		}

		protected new void HandlePlayerKilled(object sender, PlayerKilledEventArgs e)
		{
			if (!IsMatchStarted || e.Victim == null) return;

			Weapon weapon = Weapon.WeaponList.FirstOrDefault(w => w.Element == e.Weapon.Weapon);
			if (weapon == null) return;
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
				KilledSteamId = e.Victim.SteamID,
				KilledName = e.Victim.Name,
				KilledSide = e.Victim.Team.ToSide(),
				RoundNumber = CurrentRound.Number,
				IsKillerCrouching = e.Killer?.IsDucking ?? false,
				IsHeadshot = e.Headshot,
				Point = new KillHeatmapPoint
				{
					KillerX = e.Killer?.Position.X ?? 0,
					KillerY = e.Killer?.Position.Y ?? 0,
					VictimX = e.Victim.Position.X,
					VictimY = e.Victim.Position.Y
				}
			};

			bool killerIsBot = e.Killer != null && e.Killer.SteamID == 0;
			bool victimIsBot = e.Victim.SteamID == 0;
			bool assisterIsBot = e.Assister != null && e.Assister.SteamID == 0;

			if (e.Killer != null) killer = Demo.Players.FirstOrDefault(player => player.SteamId == e.Killer.SteamID);
			if (killer != null)
			{
				if (e.Victim.SteamID != killer.SteamId) killer.RoundsMoneyEarned[CurrentRound.Number] += weapon.KillAward;

				ProcessTradeKill(killEvent);
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
					RoundNumber = CurrentRound.Number
				};
				Demo.PositionPoints.Add(positionPoint);
			}
		}

		protected new void HandlePlayerTeam(object sender, PlayerTeamEventArgs e)
		{
			if (e.Swapped == null || e.Swapped.SteamID == 0) return;
			Player player = Demo.Players.FirstOrDefault(p => p.SteamId == e.Swapped.SteamID);
			if (player == null) return;
			player.IsConnected = true;
			player.Side = e.NewTeam.ToSide();
			// add the player to its team if he is not
			if (!Demo.TeamCT.Players.Contains(player) && !Demo.TeamT.Players.Contains(player))
			{
				if (e.NewTeam.ToSide() == Side.CounterTerrorist && !Demo.TeamCT.Players.Contains(player))
					Application.Current.Dispatcher.Invoke(() => Demo.TeamCT.Players.Add(player));
				if (e.NewTeam.ToSide() == Side.Terrorist && !Demo.TeamT.Players.Contains(player))
					Application.Current.Dispatcher.Invoke(() => Demo.TeamT.Players.Add(player));
			}
		}

		#endregion

		#region Process

		private void StartMatch()
		{
			RoundCount = 0;
			IsMatchStarted = true;

			if (!string.IsNullOrWhiteSpace(Parser.CTClanName)) Demo.TeamCT.Name = Parser.CTClanName;
			if (!string.IsNullOrWhiteSpace(Parser.TClanName)) Demo.TeamT.Name = Parser.TClanName;

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
						Side = player.Team.ToSide()
					};
					if (!Demo.Players.Contains(pl))
					{
						Application.Current.Dispatcher.Invoke(delegate
						{
							Demo.Players.Add(pl);
							if (pl.Side == Side.CounterTerrorist && !Demo.TeamCT.Players.Contains(pl))
							{
								Demo.TeamCT.Players.Add(pl);
								if (!Demo.TeamCT.Players.Contains(pl))
								{
									Demo.TeamCT.Players.Add(pl);
								}
								pl.TeamName = Demo.TeamCT.Name;
							}

							if (pl.Side == Side.Terrorist && !Demo.TeamT.Players.Contains(pl))
							{
								Demo.TeamT.Players.Add(pl);
								if (!Demo.TeamT.Players.Contains(pl))
								{
									Demo.TeamT.Players.Add(pl);
								}
								pl.TeamName = Demo.TeamT.Name;
							}
						});
					}
				}
			}

			// First round handled here because round_start is raised before begin_new_match
			CreateNewRound();
		}

		/// <summary>
		/// Set the correct clan name winner
		/// </summary>
		/// <param name="e"></param>
		protected new void UpdateTeamScore(RoundEndedEventArgs e)
		{
			if (IsOvertime)
			{
				if (IsHalfMatch)
				{
					if (e.Winner.ToSide() == Side.CounterTerrorist)
					{
						CurrentRound.WinnerName = Demo.TeamT.Name;
						CurrentOvertime.ScoreTeam2++;
						Demo.ScoreTeam2++;
					}
					else
					{
						CurrentRound.WinnerName = Demo.TeamCT.Name;
						CurrentOvertime.ScoreTeam1++;
						Demo.ScoreTeam1++;
					}
				}
				else
				{
					if (e.Winner.ToSide() == Side.CounterTerrorist)
					{
						CurrentRound.WinnerName = Demo.TeamCT.Name;
						CurrentOvertime.ScoreTeam1++;
						Demo.ScoreTeam1++;
					}
					else
					{
						CurrentRound.WinnerName = Demo.TeamT.Name;
						CurrentOvertime.ScoreTeam2++;
						Demo.ScoreTeam2++;
					}
				}
			}
			else
			{
				if (IsHalfMatch)
				{
					if (e.Winner.ToSide() == Side.CounterTerrorist)
					{
						CurrentRound.WinnerName = Demo.TeamT.Name;
						Demo.ScoreSecondHalfTeam2++;
						Demo.ScoreTeam2++;
					}
					else
					{
						CurrentRound.WinnerName = Demo.TeamCT.Name;
						Demo.ScoreSecondHalfTeam1++;
						Demo.ScoreTeam1++;
					}
				}
				else
				{
					if (e.Winner.ToSide() == Side.Terrorist)
					{
						CurrentRound.WinnerName = Demo.TeamT.Name;
						Demo.ScoreFirstHalfTeam2++;
						Demo.ScoreTeam2++;
					}
					else
					{
						CurrentRound.WinnerName = Demo.TeamCT.Name;
						Demo.ScoreFirstHalfTeam1++;
						Demo.ScoreTeam1++;
					}
				}
			}
		}

		#endregion
	}
}