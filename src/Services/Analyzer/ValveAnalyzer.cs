using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Events;
using DemoInfo;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using MoreLinq;

namespace CSGO_Demos_Manager.Services.Analyzer
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

		protected override sealed void RegisterEvents()
		{
			Parser.MatchStarted += HandleMatchStarted;
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
			Parser.ServerRankUpdate += HandleServerRankUpdate;
			Parser.PlayerDisconnect += HandlePlayerDisconnect;
		}

		public async override Task<Demo> AnalyzeDemoAsync(CancellationToken token)
		{
			Parser.ParseHeader();

			await Task.Run(() => Parser.ParseToEnd(token), token);

			if (Demo.Rounds.Count < (Demo.ScoreTeam1 + Demo.ScoreTeam2))
			{
				Application.Current.Dispatcher.Invoke(delegate
				{
					Demo.Rounds.Add(CurrentRound);
				});
			}

			Application.Current.Dispatcher.Invoke(delegate
			{
				Demo.MostHeadshotPlayer = Demo.Players.OrderByDescending(x => x.HeadshotPercent).First();
				Demo.MostBombPlantedPlayer = Demo.Players.OrderByDescending(x => x.BombPlantedCount).First();
				Demo.MostEntryKillPlayer = Demo.Players.MaxBy(p => p.EntryKills.Count);
				var weapons = Demo.Kills.GroupBy(k => k.Weapon).Select(weap => new
				{
					Weapon = weap.Key,
					Count = weap.Count()
				}).OrderByDescending(w => w.Count);
				Demo.MostKillingWeapon = weapons.Select(w => w.Weapon).First();
			});

			if (AnalyzePlayersPosition)
			{
				LastPlayersFireEndedMolotov.Clear();
			}

			return Demo;
		}

		#region Events Handlers

		private void HandleServerRankUpdate(object sender, ServerRankUpdateEventArgs e)
		{
			foreach (ServerRankUpdateEventArgs.RankStruct rankStruct in e.RankStructList)
			{
				PlayerExtended player = Demo.Players.FirstOrDefault(p => p.SteamId == rankStruct.SteamId);
				if (player != null)
				{
					player.RankNumberOld = rankStruct.Old;
					player.RankNumberNew = rankStruct.New;
					player.WinCount = rankStruct.NumWins;
				}
			}
		}

		private void HandleBotTakeOver(object sender, BotTakeOverEventArgs e)
		{
			if (!IsMatchStarted) return;
			PlayerExtended player = Demo.Players.FirstOrDefault(p => p.SteamId == e.Taker.SteamID);
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
			RoundCount = 0;
			IsMatchStarted = true;

			if (!string.IsNullOrWhiteSpace(Parser.CTClanName)) Demo.TeamCT.Name = Parser.CTClanName;
			if (!string.IsNullOrWhiteSpace(Parser.TClanName)) Demo.TeamT.Name = Parser.TClanName;

			// Add all players to our ObservableCollection of PlayerExtended
			foreach (Player player in Parser.PlayingParticipants)
			{
				// don't add bot
				if (player.SteamID != 0)
				{
					PlayerExtended pl = new PlayerExtended
					{
						SteamId = player.SteamID,
						Name = player.Name,
						Side = player.Team
					};
					if (!Demo.Players.Contains(pl))
					{
						Application.Current.Dispatcher.Invoke(delegate
						{
							Demo.Players.Add(pl);
							if (pl.Side == Team.CounterTerrorist && !Demo.TeamCT.Players.Contains(pl))
							{
								Demo.TeamCT.Players.Add(pl);
								if (!Demo.TeamCT.Players.Contains(pl))
								{
									Demo.TeamCT.Players.Add(pl);
								}
								pl.Team = Demo.TeamCT;
							}

							if (pl.Side == Team.Terrorist && !Demo.TeamT.Players.Contains(pl))
							{
								Demo.TeamT.Players.Add(pl);
								if (!Demo.TeamT.Players.Contains(pl))
								{
									Demo.TeamT.Players.Add(pl);
								}
								pl.Team = Demo.TeamT;
							}
						});
					}
				}
			}

			// First round handled here because round_start is raised before begin_new_match
			CreateNewRound();
		}

		protected override void HandleRoundStart(object sender, RoundStartedEventArgs e)
		{
			if (!IsMatchStarted) return;
			// Check players count to prevent missing players who was connected after the match started event
			if (Demo.Players.Count < 10)
			{
				// Add all players to our ObservableCollection of PlayerExtended
				foreach (Player player in Parser.PlayingParticipants)
				{
					// don't add bot and already known players
					if (player.SteamID != 0 && Demo.Players.FirstOrDefault(p => p.SteamId == player.SteamID) == null)
					{
						PlayerExtended pl = new PlayerExtended
						{
							SteamId = player.SteamID,
							Name = player.Name,
							Side = player.Team
						};
						Application.Current.Dispatcher.Invoke(delegate
						{
							Demo.Players.Add(pl);
							pl.Team = pl.Side == Team.CounterTerrorist ? Demo.TeamCT : Demo.TeamT;
						});
					}
				}
			}
			CreateNewRound();
		}

		protected override void HandleRoundEnd(object sender, RoundEndedEventArgs e)
		{
			if (!IsMatchStarted) return;

			UpdateTeamScore(e);

			if (e.Reason == RoundEndReason.CTSurrender)
			{
				Demo.Surrender = IsHalfMatch ? Demo.TeamT : Demo.TeamCT;
			}
			if (e.Reason == RoundEndReason.TerroristsSurrender)
			{
				Demo.Surrender = IsHalfMatch ? Demo.TeamCT : Demo.TeamT;
			}

			Application.Current.Dispatcher.Invoke(delegate
			{
				CurrentRound.WinnerSide = e.Winner;
				

				if (CurrentRound.OpenKillEvent != null)
				{
					if (CurrentRound.OpenKillEvent.KillerTeam == Team.Terrorist && e.Winner == Team.Terrorist ||
					CurrentRound.OpenKillEvent.KillerTeam == Team.CounterTerrorist && e.Winner == Team.CounterTerrorist)
					{
						if (CurrentRound.OpenKillEvent != null) CurrentRound.OpenKillEvent.HasWin = true;
						if (CurrentRound.EntryKillEvent != null) CurrentRound.EntryKillEvent.HasWin = true;
					}
					var playerWithEntryKill = Demo.Players.FirstOrDefault(p => p.HasEntryKill);
					playerWithEntryKill?.EntryKills.Add(CurrentRound.EntryKillEvent);

					var playerWithOpeningKill = Demo.Players.FirstOrDefault(p => p.HasOpeningKill);
					playerWithOpeningKill?.OpeningKills.Add(CurrentRound.OpenKillEvent);
				}
			});

			if (IsLastRoundHalf)
			{
				Application.Current.Dispatcher.Invoke(delegate
				{
					IsSwapTeamRequired = true;
					Demo.Rounds.Add(CurrentRound);
				});
			}

			if (IsOvertime && IsLastRoundHalf) IsHalfMatch = false;
		}

		protected void HandleWinPanelMatch(object sender, WinPanelMatchEventArgs e)
		{
			if (!IsMatchStarted) return;

			if (IsOvertime)
			{
				Application.Current.Dispatcher.Invoke(delegate
				{
					Demo.Overtimes.Add(CurrentOvertime);
				});
			}

			ProcessPlayersRating();
			Demo.Winner = Parser.CTScore > Parser.TScore ? Demo.TeamCT : Demo.TeamT;
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

		protected override void HandlePlayerKilled(object sender, PlayerKilledEventArgs e)
		{
			if (!IsMatchStarted) return;
			if (e.Killer == null || e.Victim == null) return;

			KillEvent killEvent = new KillEvent(Parser.IngameTick)
			{
				Weapon = new Weapon(e.Weapon)
			};

			bool killerIsBot = false;
			bool victimIsBot = false;
			bool assisterIsBot = false;

			if (e.Killer.SteamID == 0) killerIsBot = true;
			if (e.Victim.SteamID == 0) victimIsBot = true;
			if (e.Assister != null && e.Assister.SteamID == 0) assisterIsBot = true;

			// Human killed human
			if (!killerIsBot && !victimIsBot)
			{
				killEvent.DeathPerson = Demo.Players.FirstOrDefault(player => player.SteamId == e.Victim.SteamID);
				if (killEvent.DeathPerson != null) killEvent.DeathPerson.IsAlive = false;
				killEvent.Killer = Demo.Players.FirstOrDefault(player => player.SteamId == e.Killer.SteamID);

				if (killEvent.DeathPerson != null && killEvent.Killer != null)
				{
					// TK
					if (killEvent.Killer.Team == killEvent.DeathPerson.Team)
					{
						killEvent.Killer.TeamKillCount++;
						killEvent.Killer.KillsCount--;
						if (killEvent.Killer.HeadshotCount > 0) killEvent.Killer.HeadshotCount--;
						killEvent.DeathPerson.DeathCount++;
					}
					else
					{
						// Regular kill
						if (!killEvent.Killer.IsControllingBot)
						{
							killEvent.Killer.KillsCount++;
							if(e.Headshot) killEvent.Killer.HeadshotCount++;
						}
						if (!killEvent.DeathPerson.IsControllingBot) killEvent.DeathPerson.DeathCount++;
					}
				}
			}

			// Human killed a bot
			if (!killerIsBot && victimIsBot)
			{
				killEvent.Killer = Demo.Players.FirstOrDefault(player => player.SteamId == e.Killer.SteamID);
				if (killEvent.Killer != null)
				{
					// TK
					if (killEvent.Killer.Side == e.Victim.Team)
					{
						killEvent.Killer.TeamKillCount++;
						killEvent.Killer.KillsCount--;
					}
					else
					{
						// Regular kill
						if (!killEvent.Killer.IsControllingBot)
						{
							killEvent.Killer.KillsCount++;
							if (e.Headshot) killEvent.Killer.HeadshotCount++;
						}
					}
				}
			}

			// A bot killed a human
			if (killerIsBot && !victimIsBot)
			{
				killEvent.DeathPerson = Demo.Players.FirstOrDefault(player => player.SteamId == e.Victim.SteamID);
				// TK or not we add a death to the human
				if (killEvent.DeathPerson != null) killEvent.DeathPerson.DeathCount++;
			}
		
			// Add assist if there was one
			if (e.Assister != null && !assisterIsBot && e.Assister.Team != e.Victim.Team)
			{
				killEvent.Assister = Demo.Players.FirstOrDefault(player => player.SteamId == e.Assister.SteamID);
				if (killEvent.Assister != null) killEvent.Assister.AssistCount++;
			}

			// If the killer isn't a bot we can update individual kill, open and entry kills
			if (killEvent.Killer != null && !killEvent.Killer.IsControllingBot)
			{
				if (!KillsThisRound.ContainsKey(e.Killer))
				{
					KillsThisRound[e.Killer] = 0;
				}
				KillsThisRound[e.Killer]++;

				ProcessOpenAndEntryKills(killEvent);
			}

			ProcessClutches();

			if (AnalyzeHeatmapPoint)
			{
				killEvent.Point = new KillHeatmapPoint
				{
					KillerX = e.Killer.Position.X,
					KillerY = e.Killer.Position.Y,
					VictimX = e.Victim.Position.X,
					VictimY = e.Victim.Position.Y,
					Round = CurrentRound,
					Killer = killEvent.Killer,
					KillerTeam = e.Killer.Team,
					Victim = killEvent.DeathPerson,
					VictimTeam = e.Victim.Team
				};
			}

			Demo.Kills.Add(killEvent);
			CurrentRound.Kills.Add(killEvent);
			if (AnalyzePlayersPosition)
			{
				PositionPoint positionPoint = new PositionPoint
				{
					X = e.Victim.Position.X,
					Y = e.Victim.Position.Y,
					Player = Demo.Players.First(p => p.SteamId == e.Killer.SteamID),
					Team = e.Killer.Team,
					Event = killEvent,
					Round = CurrentRound
				};
				Demo.PositionsPoint.Add(positionPoint);
			}
		}

		#endregion

		#region Process

		/// <summary>
		/// Set the correct clan name winner
		/// </summary>
		/// <param name="roundEndedEventArgs"></param>
		protected new void UpdateTeamScore(RoundEndedEventArgs roundEndedEventArgs)
		{
			if (IsOvertime)
			{
				if (IsHalfMatch)
				{
					if (roundEndedEventArgs.Winner == Team.CounterTerrorist)
					{
						CurrentRound.WinnerClanName = Demo.TeamT.Name;
						CurrentRound.Winner = Demo.TeamT;
						CurrentOvertime.ScoreTeam2++;
						Demo.ScoreTeam2++;
					}
					else
					{
						CurrentRound.WinnerClanName = Demo.TeamCT.Name;
						CurrentRound.Winner = Demo.TeamCT;
						CurrentOvertime.ScoreTeam1++;
						Demo.ScoreTeam1++;
					}
				}
				else
				{
					if (roundEndedEventArgs.Winner == Team.CounterTerrorist)
					{
						CurrentRound.WinnerClanName = Demo.TeamCT.Name;
						CurrentRound.Winner = Demo.TeamCT;
						CurrentOvertime.ScoreTeam1++;
						Demo.ScoreTeam1++;
					}
					else
					{
						CurrentRound.WinnerClanName = Demo.TeamT.Name;
						CurrentRound.Winner = Demo.TeamT;
						CurrentOvertime.ScoreTeam2++;
						Demo.ScoreTeam2++;
					}
				}
			}
			else
			{
				if (IsHalfMatch)
				{
					if (roundEndedEventArgs.Winner == Team.CounterTerrorist)
					{
						CurrentRound.WinnerClanName = Demo.TeamT.Name;
						CurrentRound.Winner = Demo.TeamT;
						Demo.ScoreSecondHalfTeam2++;
						Demo.ScoreTeam2++;
					}
					else
					{
						CurrentRound.WinnerClanName = Demo.TeamCT.Name;
						CurrentRound.Winner = Demo.TeamCT;
						Demo.ScoreSecondHalfTeam1++;
						Demo.ScoreTeam1++;
					}
				}
				else
				{
					if (roundEndedEventArgs.Winner == Team.Terrorist)
					{
						CurrentRound.WinnerClanName = Demo.TeamT.Name;
						CurrentRound.Winner = Demo.TeamT;
						Demo.ScoreFirstHalfTeam2++;
						Demo.ScoreTeam2++;
					}
					else
					{
						CurrentRound.WinnerClanName = Demo.TeamCT.Name;
						CurrentRound.Winner = Demo.TeamCT;
						Demo.ScoreFirstHalfTeam1++;
						Demo.ScoreTeam1++;
					}
				}
			}
		}

		#endregion
	}
}