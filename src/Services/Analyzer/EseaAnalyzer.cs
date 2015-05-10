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
	public class EseaAnalyzer : DemoAnalyzer
	{
		// 2 match_started without freeze time ended = match started
		private int _matchStartedCount;

		// Used to detect swap team on overtime
		private bool _overtimeHasSwapped;

		// Keep in memory scores to detect when a new side of overtime has begun
		// On ESEA demos score doesn't change until the match is really in progress
		private int _previousScoreT;

		private int _previousScoreCT;

		public EseaAnalyzer(Demo demo)
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
		}

		public async override Task<Demo> AnalyzeDemoAsync()
		{
			Parser.ParseHeader();

			await Task.Run(() => Parser.ParseToEnd());

			Demo.Tickrate = Parser.TickRate;
			Demo.MapName = Parser.Map;
			Demo.Date = File.GetCreationTime(Demo.Path).ToString("MM/dd/yyyy HH:mm:ss.fff", CultureInfo.InvariantCulture);

			Application.Current.Dispatcher.Invoke(delegate
			{
				// As round_officialy_ended isn't raised we add the last round / OT after the analyze
				if (Demo.Rounds.Count < (Demo.ScoreTeam1 + Demo.ScoreTeam2))
				{
					UpdateKillsCount();
					UpdatePlayerScore();

					Demo.Rounds.Add(CurrentRound);

					// Add last overtime if there was an overtime at the end
					if (IsOvertime) Demo.Overtimes.Add(CurrentOvertime);
				}

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

			return Demo;
		}

		#region Handlers

		protected new void HandleFreezetimeEnded(object sender, FreezetimeEndedEventArgs e)
		{
			_matchStartedCount = 0;
			base.HandleFreezetimeEnded(sender, e);
		}

		protected override void HandleMatchStarted(object sender, MatchStartedEventArgs e)
		{
			_matchStartedCount++;

			// ESEA demos raise begin_new_match between half time, it's only when the LO3 occurs that the match resume
			if (_matchStartedCount == 1) IsMatchStarted = false;

			if (IsOvertime && _matchStartedCount == 3)
			{
				// Ignore the first OT
				if (CurrentRound.Number > 32)
				{
					if (!_overtimeHasSwapped)
					{
						SwapTeams();
						_overtimeHasSwapped = true;
					}
					else
					{
						_overtimeHasSwapped = false;
					}
				}

				if (IsHalfMatch && CurrentOvertime.ScoreTeam1 != 0 && CurrentOvertime.ScoreTeam2 != 0)
				{
					Application.Current.Dispatcher.Invoke(delegate
					{
						Demo.Overtimes.Add(CurrentOvertime);
					});
					CurrentOvertime = new Overtime()
					{
						Number = ++OvertimeCount
					};
				}

				if (Demo.Overtimes.Count > 0 && IsHalfMatch)
				{
					IsHalfMatch = false;
				}
				else
				{
					IsHalfMatch = !IsHalfMatch;
				}

				IsMatchStarted = true;
			}

			if (IsMatchStarted && CurrentRound.Number == 1)
			{
				InitPlayers();
			}
		}

		protected override void HandleRoundStart(object sender, RoundStartedEventArgs e)
		{
			// Match is really ongoing after a LO3
			if (!IsOvertime && _matchStartedCount > 1) IsMatchStarted = true;
			if (!IsMatchStarted) return;

			CreateNewRound();
		}

		protected override void HandleRoundEnd(object sender, RoundEndedEventArgs e)
		{
			_matchStartedCount = 0;

			if (!IsMatchStarted) return;

			UpdateTeamScore(e);

			Application.Current.Dispatcher.Invoke(delegate
			{
				CurrentRound.Winner = e.Winner;

				if (CurrentRound.OpenKillEvent.KillerTeam == Team.Terrorist && e.Winner == Team.Terrorist ||
					CurrentRound.OpenKillEvent.KillerTeam == Team.CounterTerrorist && e.Winner == Team.CounterTerrorist)
				{
					if (CurrentRound.OpenKillEvent != null) CurrentRound.OpenKillEvent.HasWin = true;
					if (CurrentRound.EntryKillEvent != null) CurrentRound.EntryKillEvent.HasWin = true;
				}
			});

			Application.Current.Dispatcher.Invoke(delegate
			{
				var playerWithEntryKill = Demo.Players.FirstOrDefault(p => p.HasEntryKill);
				playerWithEntryKill?.EntryKills.Add(CurrentRound.EntryKillEvent);

				var playerWithOpeningKill = Demo.Players.FirstOrDefault(p => p.HasOpeningKill);
				playerWithOpeningKill?.OpeningKills.Add(CurrentRound.OpenKillEvent);
			});

			// On ESEA demos round_announce_last_round_half isn't raised
			if (CurrentRound.Number == 15)
			{
				Application.Current.Dispatcher.Invoke(SwapTeams);
			}

		}

		protected new void HandleRoundOfficiallyEnd(object sender, RoundOfficiallyEndedEventArgs e)
		{
			// Prevent adding rounds that are between half side during overtime
			if (IsOvertime && Parser.TScore == _previousScoreT && Parser.CTScore == _previousScoreCT && !IsHalfMatch)
			{
				IsMatchStarted = false;
				return;
			}

			// Keep track of the score to avoid "warmup" round that are between half side
			if (IsOvertime)
			{
				_previousScoreCT = Parser.CTScore;
				_previousScoreT = Parser.TScore;
			}

			base.HandleRoundOfficiallyEnd(sender, e);

			if (!IsMatchStarted) return;

			int score = Demo.ScoreTeam1 + Demo.ScoreTeam2;
			if (score < 15) return;

			if (score == 15)
			{
				IsMatchStarted = false;
				IsHalfMatch = true;
			}

			if (score < 30) return;
			if (score == 30)
			{
				IsMatchStarted = false;
				IsOvertime = true;

				// Create a new round when the score is 15-15 because round_start isn't raised
				if (Parser.TScore == 15 && Parser.CTScore == 15) CreateNewRound();

				// Init the first OT
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
				},
				Killer = Demo.Players.FirstOrDefault(p => p.SteamId == e.Killer.SteamID),
				DeathPerson = Demo.Players.FirstOrDefault(p => p.SteamId == e.Victim.SteamID)
			};

			if (killEvent.Killer != null)
			{
				killEvent.Killer.KillsCount++;
				if (e.Headshot) killEvent.Killer.HeadshotCount++;
			}

			if (killEvent.DeathPerson != null)
			{
				killEvent.DeathPerson.DeathCount++;
				killEvent.DeathPerson.IsAlive = false;
			}

			if (e.Assister != null)
			{
				killEvent.Assister = Demo.Players.FirstOrDefault(p => p.SteamId == e.Assister.SteamID);
				if (killEvent.Assister != null) killEvent.Assister.AssistCount++;
			}

			if (!KillsThisRound.ContainsKey(e.Killer))
			{
				KillsThisRound[e.Killer] = 0;
			}
			KillsThisRound[e.Killer]++;

			// TK
			if (killEvent.Killer != null && killEvent.DeathPerson != null)
			{
				if (killEvent.Killer.Team == killEvent.DeathPerson.Team)
				{
					killEvent.Killer.KillsCount--;
					killEvent.Killer.TeamKillCount++;
				}
			}

			ProcessClutches();
			ProcessOpenAndEntryKills(killEvent);

			Demo.Kills.Add(killEvent);
		}

		#endregion

		#region Process

		private void InitPlayers()
		{
			// We must set team1 as CT and team2 as T
			TeamExtended team1 = new TeamExtended()
			{
				Name= !string.IsNullOrWhiteSpace(Parser.CTClanName) ? Parser.CTClanName : TEAM1_NAME
			};

			TeamExtended team2 = new TeamExtended()
			{
				Name = !string.IsNullOrWhiteSpace(Parser.TClanName) ? Parser.TClanName : TEAM2_NAME
			};

			Demo.ClanTagNameTeam1 = team1.Name;
			Demo.ClanTagNameTeam2 = team2.Name;

			// Add all players to our ObservableCollection of PlayerExtended and teams
			foreach (Player player in Parser.PlayingParticipants)
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
						if (!Demo.PlayersTeam1.Contains(pl)) Demo.PlayersTeam1.Add(pl);
						if (!team1.Players.Contains(pl)) team1.Players.Add(pl);
					}

					if (pl.Team == Team.Terrorist)
					{
						if (!Demo.PlayersTeam2.Contains(pl)) Demo.PlayersTeam2.Add(pl);
						if (!team2.Players.Contains(pl)) team2.Players.Add(pl);
					}
				});
			}

			// Add teams
			Application.Current.Dispatcher.Invoke(delegate
			{
				Demo.Teams.Clear();
				Demo.Teams.Add(team1);
				Demo.Teams.Add(team2);
			});
		}

		#endregion
	}
}