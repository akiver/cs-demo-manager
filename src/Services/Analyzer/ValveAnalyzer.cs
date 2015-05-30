using System.Globalization;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Events;
using DemoInfo;
using System.IO;
using System.Linq;
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
			Parser.FreezetimeEnded += HandleFreezetimeEnded;
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
		}

		public async override Task<Demo> AnalyzeDemoAsync()
		{
			Parser.ParseHeader();

			await Task.Run(() => Parser.ParseToEnd());

			Demo.Tickrate = Parser.TickRate;
			Demo.MapName = Parser.Map;
			Demo.Duration = Parser.Header.PlaybackTime;
			if (Properties.Settings.Default.DateFormatEuropean)
			{
				Demo.Date = File.GetCreationTime(Demo.Path).ToString("dd/MM/yyyy HH:mm:ss", CultureInfo.InvariantCulture);
			}
			else
			{
				Demo.Date = File.GetCreationTime(Demo.Path).ToString("MM/dd/yyyy HH:mm:ss", CultureInfo.InvariantCulture);
			}

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
			IsMatchStarted = true;

			TeamExtended team1 = new TeamExtended()
			{
				Name = !string.IsNullOrWhiteSpace(Parser.CTClanName) ? Parser.CTClanName : TEAM1_NAME
			};
			TeamExtended team2 = new TeamExtended()
			{
				Name = !string.IsNullOrWhiteSpace(Parser.TClanName) ? Parser.TClanName : TEAM2_NAME
			};

			Demo.ClanTagNameTeam1 = team1.Name;
			Demo.ClanTagNameTeam2 = team2.Name;

			// Add all players to our ObservableCollection of PlayerExtended
			foreach (Player player in Parser.PlayingParticipants)
			{
				PlayerExtended pl = new PlayerExtended
				{
					SteamId = player.SteamID,
					Name = player.Name,
					Team = player.Team
				};
				if (!Demo.Players.Contains(pl))
				{
					Application.Current.Dispatcher.Invoke(delegate
					{
						Demo.Players.Add(pl);
						if (pl.Team == Team.CounterTerrorist && !Demo.PlayersTeam1.Contains(pl))
						{
							Demo.PlayersTeam1.Add(pl);
							if (!team1.Players.Contains(pl))
							{
								team1.Players.Add(pl);
							}
						}

						if (pl.Team == Team.Terrorist && !Demo.PlayersTeam2.Contains(pl))
						{
							Demo.PlayersTeam2.Add(pl);
							if (!team2.Players.Contains(pl))
							{
								team2.Players.Add(pl);
							}
						}
					});
				}
			}

			Application.Current.Dispatcher.Invoke(delegate
			{
				if (!Demo.Teams.Contains(team1)) Demo.Teams.Add(team1);
				if (!Demo.Teams.Contains(team2)) Demo.Teams.Add(team2);
			});

			// First round handled here because round_start is raised before begin_new_match
			CreateNewRound();
		}

		protected override void HandleRoundStart(object sender, RoundStartedEventArgs e)
		{
			if (!IsMatchStarted) return;

			IsFreezetime = true;

			CreateNewRound();
		}

		protected override void HandleRoundEnd(object sender, RoundEndedEventArgs e)
		{
			if (!IsMatchStarted) return;

			UpdateTeamScore(e);

			Application.Current.Dispatcher.Invoke(delegate
			{
				CurrentRound.Winner = e.Winner;

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
					UpdateKillsCount();
					SwapTeams();
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
				Point = new HeatmapPoint
				{
					X = e.Victim.Position.X,
					Y = e.Victim.Position.Y
				},
				Weapon = new Weapon()
				{
					Name = e.Weapon.Weapon.ToString(),
					AmmoInMagazine = e.Weapon.AmmoInMagazine,
					ReserveAmmo = e.Weapon.ReserveAmmo
				}
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
					if (killEvent.Killer.Team == e.Victim.Team)
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
			if (killEvent.Killer != null)
			{
				if (!killEvent.Killer.IsControllingBot)
				{
					if (!KillsThisRound.ContainsKey(e.Killer))
					{
						KillsThisRound[e.Killer] = 0;
					}
					KillsThisRound[e.Killer]++;

					ProcessOpenAndEntryKills(killEvent);
				}
			}

			Demo.TotalKillCount++;
			ProcessClutches();

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
						CurrentRound.WinnerClanName = !string.IsNullOrWhiteSpace(Demo.ClanTagNameTeam2) ? Demo.ClanTagNameTeam2 : TEAM2_NAME;
						CurrentOvertime.ScoreTeam2++;
						Demo.ScoreTeam2++;
					}
					else
					{
						CurrentRound.WinnerClanName = !string.IsNullOrWhiteSpace(Demo.ClanTagNameTeam1) ? Demo.ClanTagNameTeam1 : TEAM1_NAME;
						CurrentOvertime.ScoreTeam1++;
						Demo.ScoreTeam1++;
					}
				}
				else
				{
					if (roundEndedEventArgs.Winner == Team.CounterTerrorist)
					{
						CurrentRound.WinnerClanName = !string.IsNullOrWhiteSpace(Demo.ClanTagNameTeam1) ? Demo.ClanTagNameTeam1 : TEAM1_NAME;
						CurrentOvertime.ScoreTeam1++;
						Demo.ScoreTeam1++;
					}
					else
					{
						CurrentRound.WinnerClanName = !string.IsNullOrWhiteSpace(Demo.ClanTagNameTeam2) ? Demo.ClanTagNameTeam2 : TEAM2_NAME;
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
						CurrentRound.WinnerClanName = !string.IsNullOrWhiteSpace(Demo.ClanTagNameTeam2) ? Demo.ClanTagNameTeam2 : TEAM2_NAME;
						Demo.ScoreSecondHalfTeam2++;
						Demo.ScoreTeam2++;
					}
					else
					{
						CurrentRound.WinnerClanName = !string.IsNullOrWhiteSpace(Demo.ClanTagNameTeam1) ? Demo.ClanTagNameTeam1 : TEAM1_NAME;
						Demo.ScoreSecondHalfTeam1++;
						Demo.ScoreTeam1++;
					}
				}
				else
				{
					if (roundEndedEventArgs.Winner == Team.Terrorist)
					{
						CurrentRound.WinnerClanName = !string.IsNullOrWhiteSpace(Demo.ClanTagNameTeam2) ? Demo.ClanTagNameTeam2 : TEAM2_NAME;
						Demo.ScoreFirstHalfTeam2++;
						Demo.ScoreTeam2++;
					}
					else
					{
						CurrentRound.WinnerClanName = !string.IsNullOrWhiteSpace(Demo.ClanTagNameTeam1) ? Demo.ClanTagNameTeam1 : TEAM1_NAME;
						Demo.ScoreFirstHalfTeam1++;
						Demo.ScoreTeam1++;
					}
				}
			}
		}

		#endregion
	}
}