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

		protected sealed override void RegisterEvents()
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

		public override async Task<Demo> AnalyzeDemoAsync(CancellationToken token)
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
								pl.TeamName = Demo.TeamCT.Name;
							}

							if (pl.Side == Team.Terrorist && !Demo.TeamT.Players.Contains(pl))
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
							pl.TeamName = pl.Side == Team.CounterTerrorist ? Demo.TeamCT.Name : Demo.TeamT.Name;
						});
					}
				}
			}
			CreateNewRound();
		}

		protected override void HandleRoundEnd(object sender, RoundEndedEventArgs e)
		{
			if (!IsMatchStarted) return;

			CurrentRound.EndReason = e.Reason;
			CurrentRound.EndTimeSeconds = Parser.CurrentTime;
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
					if (CurrentRound.OpenKillEvent.KillerSide == Team.Terrorist && e.Winner == Team.Terrorist ||
					CurrentRound.OpenKillEvent.KillerSide == Team.CounterTerrorist && e.Winner == Team.CounterTerrorist)
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

		protected new void HandlePlayerKilled(object sender, PlayerKilledEventArgs e)
		{
			if (!IsMatchStarted ||e.Victim == null) return;

			Weapon weapon = Weapon.WeaponList.FirstOrDefault(w => w.Element == e.Weapon.Weapon);
			if (weapon == null) return;
			PlayerExtended killed = Demo.Players.FirstOrDefault(player => player.SteamId == e.Victim.SteamID);
			if (killed == null) return;
			PlayerExtended killer = null;

			KillEvent killEvent = new KillEvent(Parser.IngameTick, Parser.CurrentTime)
			{
				KillerSteamId = e.Killer?.SteamID ?? 0,
				KillerName = e.Killer?.Name ?? "World",
				KillerSide = e.Killer?.Team ?? Team.Spectate,
				Weapon = weapon,
				KillerVelocityX = e.Killer?.Velocity.X ?? 0,
				KillerVelocityY = e.Killer?.Velocity.Y ?? 0,
				KillerVelocityZ = e.Killer?.Velocity.Z ?? 0,
				KilledSteamId = e.Victim.SteamID,
				KilledName = e.Victim.Name,
				KilledSide = e.Victim.Team,
				RoundNumber = CurrentRound.Number
			};

			bool killerIsBot = false;
			bool victimIsBot = false;
			bool assisterIsBot = false;

			if (e.Killer != null && e.Killer.SteamID == 0) killerIsBot = true;
			if (e.Victim.SteamID == 0) victimIsBot = true;
			if (e.Assister != null && e.Assister.SteamID == 0) assisterIsBot = true;
			if (e.Killer != null) killer = Demo.Players.FirstOrDefault(player => player.SteamId == e.Killer.SteamID);
			if (killer != null)
			{
				if (e.Killer.IsDucking) killer.CrouchKillCount++;
				if (e.Killer.Velocity.Z > 0) killer.JumpKillCount++;
			}

			// Human killed human
			if (!killerIsBot && !victimIsBot)
			{
				killed.IsAlive = false;
				if (killer != null)
				{
					// TK
					if (killer.TeamName == killed.TeamName)
					{
						killer.TeamKillCount++;
						killer.KillsCount--;
						if (killer.HeadshotCount > 0) killer.HeadshotCount--;
						killed.DeathCount++;
					}
					else
					{
						// Regular kill
						if (!killer.IsControllingBot)
						{
							killer.KillsCount++;
							if(e.Headshot) killer.HeadshotCount++;
						}
						if (!killed.IsControllingBot) killed.DeathCount++;
					}
				}
			}

			// Human killed a bot
			if (!killerIsBot && victimIsBot)
			{
				if (killer != null)
				{
					// TK
					if (killer.Side == e.Victim.Team)
					{
						killer.TeamKillCount++;
						killer.KillsCount--;
					}
					else
					{
						// Regular kill
						if (!killer.IsControllingBot)
						{
							killer.KillsCount++;
							if (e.Headshot) killer.HeadshotCount++;
						}
					}
				}
			}

			// A bot killed a human
			if (killerIsBot && !victimIsBot)
			{
				// TK or not we add a death to the human
				killed.DeathCount++;
			}
		
			// Add assist if there was one
			if (e.Assister != null && !assisterIsBot && e.Assister.Team != e.Victim.Team)
			{
				PlayerExtended assister = Demo.Players.FirstOrDefault(player => player.SteamId == e.Assister.SteamID);
				if (assister != null)
				{
					killEvent.AssisterSteamId = e.Assister.SteamID;
					killEvent.AssisterName = e.Assister.Name;
					assister.AssistCount++;
				}
			}

			// If the killer isn't a bot we can update individual kill, open and entry kills
			if (e.Killer != null && killer != null && !killer.IsControllingBot)
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
					KillerX = e.Killer?.Position.X ?? 0,
					KillerY = e.Killer?.Position.Y ?? 0,
					VictimX = e.Victim.Position.X,
					VictimY = e.Victim.Position.Y,
					Round = CurrentRound,
					KillerSteamId = e.Killer?.SteamID ?? 0,
					KillerName = e.Killer?.Name ?? string.Empty,
					KillerTeam = e.Killer?.Team ?? Team.Spectate,
					VictimSteamId = e.Victim.SteamID,
					VictimName = e.Victim.Name,
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
					PlayerSteamId = e.Killer?.SteamID ?? 0,
					PlayerName = e.Killer?.Name ?? string.Empty,
					Team = e.Killer?.Team ?? Team.Spectate,
					Event = killEvent,
					RoundNumber = CurrentRound.Number
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
					if (roundEndedEventArgs.Winner == Team.CounterTerrorist)
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
					if (roundEndedEventArgs.Winner == Team.CounterTerrorist)
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
					if (roundEndedEventArgs.Winner == Team.Terrorist)
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