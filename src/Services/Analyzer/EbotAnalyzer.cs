using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Events;
using DemoInfo;
using MoreLinq;

namespace CSGO_Demos_Manager.Services.Analyzer
{
	public class EbotAnalyzer : DemoAnalyzer
	{
		private bool _isLastRoundFinal;

		// Counter of player team swap (used detect end of a half)
		private int _playerTeamCount;

		private bool _isMatchStartedOccured = false;

		private bool _isTeamsInitialized = false;

		public EbotAnalyzer(Demo demo)
		{
			Parser = new DemoParser(File.OpenRead(demo.Path));
			// Reset to have update on UI
			demo.ResetStats();
			Demo = demo;
			RegisterEvents();
			IsMatchStarted = true;
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
			Parser.LastRoundHalf += HandleLastRoundHalf;
			Parser.PlayerTeam += HandlePlayerTeam;
			Parser.RoundFinal += HandleRoundFinal;
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
			Application.Current.Dispatcher.Invoke(ProcessPlayersRating);
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

			if (Properties.Settings.Default.DateFormatEuropean)
			{
				Demo.Date = File.GetCreationTime(Demo.Path).ToString("dd/MM/yyyy HH:mm:ss", CultureInfo.InvariantCulture);
			}
			else
			{
				Demo.Date = File.GetCreationTime(Demo.Path).ToString("MM/dd/yyyy HH:mm:ss", CultureInfo.InvariantCulture);
			}

			if (AnalyzePlayersPosition)
			{
				LastPlayersFireEndedMolotov.Clear();
			}

			return Demo;
		}

		protected new void HandleWeaponFired(object sender, WeaponFiredEventArgs e)
		{
			if (!_isTeamsInitialized) return;

			base.HandleWeaponFired(sender, e);
		}

		protected void HandlePlayerTeam(object sender, PlayerTeamEventArgs e)
		{
			if (!IsMatchStarted && !IsOvertime) return;
			if (e.Silent) _playerTeamCount++;
		}

		protected void HandleLastRoundHalf(object sender, LastRoundHalfEventArgs e)
		{
			if (!IsMatchStarted) return;
			if (IsOvertime) IsLastRoundHalf = true;
		}

		protected void HandleWinPanelMatch(object sender, WinPanelMatchEventArgs e)
		{
			Application.Current.Dispatcher.Invoke(delegate
			{
				Demo.Rounds.Add(CurrentRound);
			});

			if (IsMatchStarted && !IsOvertime)
			{
				// Stop analyze
				IsMatchStarted = false;
				return;
			}

			if (CurrentOvertime.ScoreTeam1 != 0 || CurrentOvertime.ScoreTeam2 != 0)
			{
				// Add the last overtime
				Application.Current.Dispatcher.Invoke(delegate
				{
					Demo.Overtimes.Add(CurrentOvertime);
				});
			}
		}

		protected void HandleRoundFinal(object sender, RoundFinalEventArgs e)
		{
			// Detect OT swap, we cannot know if it's MR3 or MR5
			if (IsOvertime) _isLastRoundFinal = true;
		}

		protected override void HandleMatchStarted(object sender, MatchStartedEventArgs e)
		{
			if (!IsMatchStarted) return;

			if (!_isMatchStartedOccured && !IsOvertime)
			{
				_isMatchStartedOccured = true;
				// Reset demo start recording before
				Demo.ResetStats(false);
				AddTeams();
				RoundCount = 0;
				CreateNewRound();
			}
		}

		protected override void HandleRoundStart(object sender, RoundStartedEventArgs e)
		{
			if (!IsMatchStarted) return;

			IsFreezetime = true;

			// Reset until both scores > 0
			if (Parser.CTScore == 0 && Parser.TScore == 0)
			{
				Demo.ResetStats(false);
				RoundCount = 0;
				AddTeams();
			}

			CreateNewRound();

			if (RoundCount == 16)
			{
				IsHalfMatch = true;
				SwapTeams();
			}

			if(!IsOvertime) return;

			// Detect the half of an overtime
			if (_playerTeamCount > 8 && IsLastRoundHalf) IsHalfMatch = !IsHalfMatch;
			if (IsLastRoundHalf) IsLastRoundHalf = false;
			_playerTeamCount = 0;
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
						if (CurrentRound.OpenKillEvent.KillerTeam == Team.Terrorist && e.Winner == Team.Terrorist ||
							CurrentRound.OpenKillEvent.KillerTeam == Team.CounterTerrorist && e.Winner == Team.CounterTerrorist)
						{
							if (CurrentRound.OpenKillEvent != null) CurrentRound.OpenKillEvent.HasWin = true;
							if (CurrentRound.EntryKillEvent != null) CurrentRound.EntryKillEvent.HasWin = true;
						}
					}
				}
			});

			// On faceit round_officialy_ended is raised between half side, not on eBot public demos
			if (IsLastRoundHalf)
			{
				Application.Current.Dispatcher.Invoke(delegate
				{
					Demo.Rounds.Add(CurrentRound);
				});
				if (!IsOvertime) return;
			}

			Application.Current.Dispatcher.Invoke(delegate
			{
				var playerWithEntryKill = Demo.Players.FirstOrDefault(p => p.HasEntryKill);
				playerWithEntryKill?.EntryKills.Add(CurrentRound.EntryKillEvent);

				var playerWithOpeningKill = Demo.Players.FirstOrDefault(p => p.HasOpeningKill);
				playerWithOpeningKill?.OpeningKills.Add(CurrentRound.OpenKillEvent);

				// Last round of the match or of an overtime, the final overtime is added on cs_win_panel_match
				if (IsOvertime && _isLastRoundFinal)
				{
					Demo.Overtimes.Add(CurrentOvertime);
					_isLastRoundFinal = false;

					CurrentOvertime = new Overtime
					{
						Number = ++OvertimeCount
					};
				}
			});
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

			killEvent.DeathPerson = Demo.Players.FirstOrDefault(player => player.SteamId == e.Victim.SteamID);
			if (killEvent.DeathPerson != null)
			{
				killEvent.DeathPerson.IsAlive = false;
			}

			if (e.Assister != null)
			{
				killEvent.Assister = Demo.Players.FirstOrDefault(player => player.SteamId == e.Assister.SteamID);
			}

			// If the killer isn't a bot we can add a kill to the match
			Demo.TotalKillCount++;
			killEvent.Killer = Demo.Players.FirstOrDefault(player => player.SteamId == e.Killer.SteamID);

			if (killEvent.Killer != null)
			{
				if (!KillsThisRound.ContainsKey(e.Killer))
				{
					KillsThisRound[e.Killer] = 0;
				}
				KillsThisRound[e.Killer]++;

				ProcessOpenAndEntryKills(killEvent);
			}

			if (killEvent.DeathPerson != null)
			{
				killEvent.DeathPerson.DeathCount++;

				// TK
				if (e.Killer.Team == e.Victim.Team)
				{
					if (killEvent.Killer != null && killEvent.DeathPerson != null)
					{
						PlayerExtended player = Demo.Players.FirstOrDefault(p => p.SteamId == e.Killer.SteamID);
						if (player != null) player.TeamKillCount++;
					}
				}
				else
				{
					if (killEvent.Killer != null)
					{
						killEvent.Killer.KillsCount++;
						if (e.Headshot)
						{
							killEvent.Killer.HeadshotCount++;
						}
					}
				}
			}

			if (killEvent.Assister != null)
			{
				killEvent.Assister.AssistCount++;
			}

			ProcessClutches();

			Demo.Kills.Add(killEvent);
			CurrentRound.Kills.Add(killEvent);

			if (AnalyzePlayersPosition && killEvent.Killer != null)
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

		protected new void HandleRoundOfficiallyEnd(object sender, RoundOfficiallyEndedEventArgs e)
		{
			base.HandleRoundOfficiallyEnd(sender, e);

			int score = Demo.ScoreTeam1 + Demo.ScoreTeam2;
			if (score < 30) return;
			if (score == 30)
			{
				IsHalfMatch = false;
				IsOvertime = true;
				CurrentOvertime = new Overtime
				{
					Number = ++OvertimeCount
				};
			}
		}

		protected new void HandleTickDone(object sender, TickDoneEventArgs e)
		{
			if (Parser.PlayingParticipants.Count() >= 10
				&& Parser.PlayingParticipants.FirstOrDefault(p => p.SteamID == 0) == null
				&& !_isTeamsInitialized)
			{
				Application.Current.Dispatcher.Invoke(delegate
				{
					if (Demo.Players.Count < 10)
					{
						AddTeams();
					}
					else
					{
						_isTeamsInitialized = true;
					}
					Demo.Rounds.Clear();
					RoundCount = 0;
					CreateNewRound();
					CurrentRound.EquipementValueTeam1 = Parser.Participants.Where(a => a.Team == Team.CounterTerrorist).Sum(a => a.CurrentEquipmentValue);
					CurrentRound.EquipementValueTeam2 = Parser.Participants.Where(a => a.Team == Team.Terrorist).Sum(a => a.CurrentEquipmentValue);
				});
			}

			base.HandleTickDone(sender, e);
		}

		private void AddTeams()
		{
			// We must set team1 as CT and team2 as T
			TeamExtended team1 = new TeamExtended()
			{
				Name = Parser.CTClanName
			};

			TeamExtended team2 = new TeamExtended()
			{
				Name = Parser.TClanName
			};

			Demo.ClanTagNameTeam1 = team1.Name;
			Demo.ClanTagNameTeam2 = team2.Name;

			// Add all players to our ObservableCollection of PlayerExtended and teams
			foreach (Player player in Parser.PlayingParticipants)
			{
				if (player.SteamID != 0)
				{
					PlayerExtended pl = new PlayerExtended
					{
						SteamId = player.SteamID,
						Name = player.Name,
						Team = player.Team
					};

					Application.Current.Dispatcher.Invoke(delegate
					{
						if (!Demo.Players.Contains(pl)) Demo.Players.Add(pl);

						if (pl.Team == Team.CounterTerrorist)
						{
							// Check swap
							if (Demo.PlayersTeam2.Contains(pl))
							{
								Demo.PlayersTeam1.Add(Demo.PlayersTeam2.First(p => p.Equals(pl)));
								Demo.PlayersTeam2.Remove(pl);
							}
							else
							{
								if (!Demo.PlayersTeam1.Contains(pl)) Demo.PlayersTeam1.Add(pl);
							}
							team1.Players.Add(Demo.Players.First(p => p.Equals(pl)));
						}

						if (pl.Team == Team.Terrorist)
						{
							// Check swap
							if (Demo.PlayersTeam1.Contains(pl))
							{
								Demo.PlayersTeam2.Add(Demo.PlayersTeam1.First(p => p.Equals(pl)));
								Demo.PlayersTeam1.Remove(pl);
							}
							else
							{
								if (!Demo.PlayersTeam2.Contains(pl)) Demo.PlayersTeam2.Add(pl);
							}
							team2.Players.Add(Demo.Players.First(p => p.Equals(pl)));
						}
					});
				}
			}

			// Add teams
			Application.Current.Dispatcher.Invoke(delegate
			{
				Demo.Teams.Clear();
				Demo.Teams.Add(team1);
				Demo.Teams.Add(team2);
			});
		}
	}
}