using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using CSGO_Demos_Manager.Models;
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

		protected sealed override void RegisterEvents()
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
			Parser.SmokeNadeEnded += HandleSmokeNadeEnded;
			Parser.FireNadeStarted += HandleFireNadeStarted;
			Parser.DecoyNadeStarted += HandleDecoyNadeStarted;
			Parser.DecoyNadeEnded += HandleDecoyNadeEnded;
			Parser.PlayerHurt += HandlePlayerHurted;
			Parser.PlayerDisconnect += HandlePlayerDisconnect;
			Parser.PlayerTeam += HandlePlayerTeam;
		}

		public override async Task<Demo> AnalyzeDemoAsync(CancellationToken token)
		{
			Parser.ParseHeader();

			await Task.Run(() => Parser.ParseToEnd(token), token);

			Application.Current.Dispatcher.Invoke(delegate
			{
				Demo.Winner = Demo.ScoreTeam1 > Demo.ScoreTeam2 ? Demo.TeamCT : Demo.TeamT;

				// As round_officialy_ended isn't raised we add the last round / OT after the analyze
				if (Demo.Rounds.Count < Demo.ScoreTeam1 + Demo.ScoreTeam2)
				{
					if (Demo.Players.Any())
					{
						UpdateKillsCount();
						UpdatePlayerScore();
					}
					Demo.Rounds.Add(CurrentRound);
					// Add last overtime if there was an overtime at the end
					if (IsOvertime) Demo.Overtimes.Add(CurrentOvertime);
				}
				if (Demo.Players.Any())
				{
					Demo.MostHeadshotPlayer = Demo.Players.OrderByDescending(x => x.HeadshotPercent).First();
					Demo.MostBombPlantedPlayer = Demo.Players.OrderByDescending(x => x.BombPlantedCount).First();
					Demo.MostEntryKillPlayer = Demo.Players.MaxBy(p => p.EntryKills.Count);
				}
				if (Demo.Kills.Any())
				{
					var weapons = Demo.Kills.GroupBy(k => k.Weapon).Select(weap => new
					{
						Weapon = weap.Key,
						Count = weap.Count()
					}).OrderByDescending(w => w.Count);
					if(weapons.Any()) Demo.MostKillingWeapon = weapons.Select(w => w.Weapon).First();
				}
				if (AnalyzePlayersPosition)
				{
					LastPlayersFireEndedMolotov.Clear();
				}
			});

			return Demo;
		}

		#region Handlers

		protected new void HandleFreezetimeEnded(object sender, FreezetimeEndedEventArgs e)
		{
			IsFreezetime = false;
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

			if (CurrentRound.Number == 1) InitPlayers();
		}

		protected override void HandleRoundStart(object sender, RoundStartedEventArgs e)
		{
			// Match is really ongoing after a LO3
			if (!IsOvertime && _matchStartedCount > 1) IsMatchStarted = true;
			if (Parser.CTScore == 0 && Parser.TScore == 0 && CurrentRound.Number > 15) IsMatchStarted = false;
			if (!IsMatchStarted) return;

			IsFreezetime = true;
			CreateNewRound();
		}

		protected new void HandleRoundEnd(object sender, RoundEndedEventArgs e)
		{
			_matchStartedCount = 0;
			base.HandleRoundEnd(sender, e);

			// On ESEA demos round_announce_last_round_half isn't raised
			if (CurrentRound.Number == 15) IsSwapTeamRequired = true;
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

		#endregion

		#region Process

		private void InitPlayers()
		{
			// Add all players to our ObservableCollection of PlayerExtended
			foreach (Player player in Parser.PlayingParticipants)
			{
				if (player.SteamID != 0)
				{
					Application.Current.Dispatcher.Invoke(delegate
					{
						PlayerExtended pl = Demo.Players.FirstOrDefault(p => p.SteamId == player.SteamID);
						if (pl == null)
						{
							pl = new PlayerExtended
							{
								SteamId = player.SteamID,
								Name = player.Name,
								Side = player.Team
							};
							Demo.Players.Add(pl);
						}

						if (pl.Side == Team.CounterTerrorist)
						{
							pl.TeamName = Demo.TeamCT.Name;
							// Check swap
							if (Demo.TeamT.Players.Contains(pl))
							{
								Demo.TeamCT.Players.Add(Demo.TeamT.Players.First(p => p.Equals(pl)));
								Demo.TeamT.Players.Remove(pl);
							}
							else
							{
								if (!Demo.TeamCT.Players.Contains(pl)) Demo.TeamCT.Players.Add(pl);
							}
						}

						if (pl.Side == Team.Terrorist)
						{
							pl.TeamName = Demo.TeamT.Name;
							// Check swap
							if (Demo.TeamCT.Players.Contains(pl))
							{
								Demo.TeamT.Players.Add(Demo.TeamCT.Players.First(p => p.Equals(pl)));
								Demo.TeamCT.Players.Remove(pl);
							}
							else
							{
								if (!Demo.TeamT.Players.Contains(pl)) Demo.TeamT.Players.Add(pl);
							}
						}
					});
				}
			}
		}

		#endregion
	}
}