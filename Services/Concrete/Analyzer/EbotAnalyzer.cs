using System;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using Core.Models;
using DemoInfo;
using Player = Core.Models.Player;
using Side = DemoInfo.Team;
using Team = Core.Models.Team;

namespace Services.Concrete.Analyzer
{
	public class EbotAnalyzer : DemoAnalyzer
	{
		// Counter of player team swap (used detect end of a half)
		private int _playerTeamCount;

		private bool _isMatchStartedOccured = false;

		private bool _isTeamsInitialized = false;

		private bool _isRoundOffiallyEndedOccured = false;

		private bool _isTeamsNameDetected = false;

		private bool _isFinalRound = false;

		/// <summary>
		/// Used to avoid additional score update when a match is over (detected by eBot text)
		/// </summary>
		private bool _isMatchEnded = false;

		/// <summary>
		/// Used to make some specific check on Faceit demos and avoid some on eBot demos
		/// </summary>
		private bool _isFaceit = false;

		private readonly Regex _scoreRegex = new Regex("^eBot: (.*) (?<score1>[0-9]+) - (?<score2>[0-9]+) (.*)$");

		private readonly Regex _faceitScoreRegex = new Regex("^ (\\[FACEIT\\^?\\]|\\[ANNA\\^\\]) (.*) \\[(?<score1>[0-9]+) - (?<score2>[0-9]+)\\] (.*)$");

		private readonly Regex _endMatchRegex = new Regex("^eBot: (.*) win(.*)$|^ \\[FACEIT\\^\\] (.*) won the match(.*)$");

		private readonly Regex _faceItLiveRegex = new Regex("^ (\\[FACEIT\\^\\]|\\[ANNA\\^\\]) LIVE!$");

		private const string EBOT_LIVE = "eBot: LIVE!";

		private const string BEGIN_FIRST_SIDE_OVERTIME = "eBot: 1st Side OT: LIVE!";

		private const string BEGIN_SECOND_SIDE_OVERTIME = "eBot: 2nd Side OT: LIVE!";

		private const string PLEASE_WRITE_READY = "eBot: Please write !ready when your team is ready !";

		public EbotAnalyzer(Demo demo)
		{
			Parser = new DemoParser(File.OpenRead(demo.Path));
			// Reset to have update on UI
			demo.ResetStats();
			Demo = demo;
			RegisterEvents();
			IsMatchStarted = true;
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
			Parser.LastRoundHalf += HandleLastRoundHalf;
			Parser.PlayerTeam += HandlePlayerTeam;
			Parser.WinPanelMatch += HandleWinPanelMatch;
			Parser.SmokeNadeEnded += HandleSmokeNadeEnded;
			Parser.FireNadeStarted += HandleFireNadeStarted;
			Parser.DecoyNadeStarted += HandleDecoyNadeStarted;
			Parser.DecoyNadeEnded += HandleDecoyNadeEnded;
			Parser.PlayerHurt += HandlePlayerHurted;
			Parser.SayText += HandleSayText;
			Parser.PlayerDisconnect += HandlePlayerDisconnect;
			Parser.RoundFinal += HandleRoundFinal;
		}

		public override async Task<Demo> AnalyzeDemoAsync(CancellationToken token)
		{
			Parser.ParseHeader();

			await Task.Run(() => Parser.ParseToEnd(token), token);

			ProcessAnalyzeEnded();

			return Demo;
		}

		protected new void HandleRoundOfficiallyEnd(object sender, RoundOfficiallyEndedEventArgs e)
		{
			base.HandleRoundOfficiallyEnd(sender, e);
			_isRoundOffiallyEndedOccured = true;
			// Don't stop the match for Faceit demos because there isn't warmup between end of the match and OT
			if (!_isFaceit && CurrentRound.Number == 30) IsMatchStarted = false;
		}

		private void HandleRoundFinal(object sender, RoundFinalEventArgs e)
		{
			if (!_isFaceit && !IsMatchStarted && !IsOvertime) return;
			_isFinalRound = true;
		}

		protected new void HandleWeaponFired(object sender, WeaponFiredEventArgs e)
		{
			if (!_isTeamsInitialized) return;
			base.HandleWeaponFired(sender, e);
		}

		protected new void HandlePlayerTeam(object sender, PlayerTeamEventArgs e)
		{
			if (e.Swapped == null || e.Swapped.SteamID == 0) return;
			Player player = Demo.Players.FirstOrDefault(p => p.SteamId == e.Swapped.SteamID);
			if (player != null)
			{
				player.IsConnected = true;
				player.Side = e.NewTeam;
			}
			if (!IsMatchStarted) return;
			if (e.Silent) _playerTeamCount++;
			if (IsOvertime && e.Silent && _playerTeamCount == 10) IsHalfMatch = !IsHalfMatch;
		}

		protected void HandleLastRoundHalf(object sender, LastRoundHalfEventArgs e)
		{
			if (!IsMatchStarted) return;
			if (_isFaceit && IsOvertime) IsLastRoundHalf = true;
		}

		protected void HandleSayText(object sender, SayTextEventArgs e)
		{
			// cleanup text
			e.Text = Regex.Replace(e.Text, @"[\u0001\u0002\u0003\u0004\u0005\u0006\u0007]", string.Empty);

			// Beginning of the match
			Match faceItLive = _faceItLiveRegex.Match(e.Text);
			if (e.Text == EBOT_LIVE || faceItLive.Success)
			{
				Demo.ResetStats(false);
				AddTeams();
				RoundCount = 0;
				CreateNewRound();
				IsMatchStarted = true;
			}

			Match scoreUpdateEbot = _scoreRegex.Match(e.Text);
			Match scoreUpdateFaceit = _faceitScoreRegex.Match(e.Text);
			// Score update
			if (scoreUpdateEbot.Success || scoreUpdateFaceit.Success)
			{
				// sometimes the parser doesn't have the right team's name when they have been swapped
				// use the first score update to know the right name of the teams
				if (!_isTeamsNameDetected)
				{
					_isTeamsNameDetected = true;
					if (Parser.CTClanName != Demo.TeamCT.Name)
					{
						foreach (Player player in Demo.Players)
						{
							player.TeamName = player.TeamName == Demo.TeamCT.Name ? Demo.TeamT.Name : Demo.TeamCT.Name;
						}
						Demo.TeamCT.Name = Parser.CTClanName;
						Demo.TeamT.Name = Parser.TClanName;
						Demo.TeamCT.Name = Parser.CTClanName;
						Demo.TeamT.Name = Parser.TClanName;
					}
				}

				int score1;
				int score2;
				if (scoreUpdateEbot.Success)
				{
					score1 = Convert.ToInt32(scoreUpdateEbot.Groups["score1"].Value);
					score2 = Convert.ToInt32(scoreUpdateEbot.Groups["score2"].Value);
				}
				else
				{
					score1 = Convert.ToInt32(scoreUpdateFaceit.Groups["score1"].Value);
					score2 = Convert.ToInt32(scoreUpdateFaceit.Groups["score2"].Value);
					_isFaceit = true;
				}

				int scoreTotal = score1 + score2;
				if (scoreTotal == 15) IsSwapTeamRequired = true;
				return;
			}

			// End of the match (OT or not)
			Match matchEnd = _endMatchRegex.Match(e.Text);
			if (matchEnd.Success)
			{
				IsMatchStarted = false;
				_isMatchEnded = true;
				return;
			}

			if (IsOvertime)
			{
				// if eBot is waiting for !ready, the match isn't started
				if (e.Text == PLEASE_WRITE_READY) IsMatchStarted = false;

				// announce the beginning of the 1st OT side
				if (e.Text == BEGIN_FIRST_SIDE_OVERTIME)
				{
					IsMatchStarted = true;
					// Add the last OT played and create a new one
					if (Demo.ScoreTeam1 + Demo.ScoreTeam2 > 30)
					{
						Application.Current.Dispatcher.Invoke(delegate
						{
							Demo.Overtimes.Add(CurrentOvertime);
						});
						CurrentOvertime = new Overtime
						{
							Number = ++OvertimeCount
						};
					}
				}

				// announce the beginning of the 2nd OT side
				if (e.Text == BEGIN_SECOND_SIDE_OVERTIME)
				{
					IsMatchStarted = true;
					IsSwapTeamRequired = true;
				}
			}
		}

		protected void HandleWinPanelMatch(object sender, WinPanelMatchEventArgs e)
		{
			if (!_isRoundOffiallyEndedOccured)
			{
				// Update players stats here because some demos doesn't have round_officialy_ended at the last round
				UpdateKillsCount();
				UpdatePlayerScore();
			}

			Application.Current.Dispatcher.Invoke(delegate
			{
				if (!IsOvertime || !_isFaceit) Demo.Rounds.Add(CurrentRound);
				if (IsOvertime) Demo.Overtimes.Add(CurrentOvertime);
			});
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
			if (_playerTeamCount > 8 && !_isMatchEnded) IsMatchStarted = true;
			if (!IsMatchStarted) return;
			_isRoundOffiallyEndedOccured = false;

			// Detect new OT for FaceIt demos
			if (_isFaceit && IsOvertime && _isFinalRound)
			{
				Application.Current.Dispatcher.Invoke(delegate
				{
					Demo.Overtimes.Add(CurrentOvertime);
				});
				CurrentOvertime = new Overtime
				{
					Number = ++OvertimeCount
				};
				IsHalfMatch = false;
			}
			_isFinalRound = false;

			// First OT detection for FaceIt demos
			if (Parser.CTScore + Parser.TScore == 30)
			{
				IsOvertime = true;
				CurrentOvertime = new Overtime
				{
					Number = ++OvertimeCount
				};
			}

			// Reset until both scores > 0
			// Sometimes parser scores are reseted at the end of the match, check the actual demo scores too
			if (Parser.CTScore == 0 && Parser.TScore == 0
				&& Demo.ScoreTeam1 < 16 && Demo.ScoreTeam2 < 16)
			{
				Demo.ResetStats(false);
				RoundCount = 0;
				AddTeams();
			}

			CreateNewRound();

			if (Demo.ScoreTeam1 + Demo.ScoreTeam2 == 15) IsHalfMatch = true;

			if(!IsOvertime) return;

			_playerTeamCount = 0;
		}

		protected new void HandleRoundEnd(object sender, RoundEndedEventArgs e)
		{
			base.HandleRoundEnd(sender, e);

			Application.Current.Dispatcher.Invoke(delegate
			{
				if (IsLastRoundHalf) Demo.Rounds.Add(CurrentRound);
			});
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
					CurrentRound.EquipementValueTeam1 = Parser.Participants.Where(a => a.Team == Side.CounterTerrorist).Sum(a => a.CurrentEquipmentValue);
					CurrentRound.EquipementValueTeam2 = Parser.Participants.Where(a => a.Team == Side.Terrorist).Sum(a => a.CurrentEquipmentValue);
					if (!string.IsNullOrEmpty(Parser.CTClanName)) Demo.TeamCT.Name = Parser.CTClanName;
					if (!string.IsNullOrEmpty(Parser.TClanName)) Demo.TeamT.Name = Parser.TClanName;
					foreach (Player player in Demo.Players)
					{
						if (!player.RoundsMoneyEarned.ContainsKey(CurrentRound.Number))
							player.RoundsMoneyEarned[CurrentRound.Number] = 0;
					}
				});
			}

			base.HandleTickDone(sender, e);
		}

		private void AddTeams()
		{
			// Detect possible swap by teams name, work for some demos
			if (Parser.TClanName == Demo.TeamCT.Name || Parser.CTClanName == Demo.TeamT.Name)
			{
				Team tmp = Demo.TeamT;
				Demo.TeamT = Demo.TeamCT;
				Demo.TeamCT = tmp.Clone();
			}

			// Add all players to our ObservableCollection of PlayerExtended
			foreach (DemoInfo.Player player in Parser.PlayingParticipants)
			{
				if (player.SteamID != 0)
				{
					Player pl = new Player
					{
						SteamId = player.SteamID,
						Name = player.Name,
						Side = player.Team
					};

					Application.Current.Dispatcher.Invoke(delegate
					{
						if (!Demo.Players.Contains(pl)) Demo.Players.Add(pl);

						if (pl.Side == Side.CounterTerrorist)
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

						if (pl.Side == Side.Terrorist)
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

		/// <summary>
		/// Update team score
		/// TODO Move to DemoAnalyzer
		/// </summary>
		/// <param name="roundEndedEventArgs"></param>
		protected new void UpdateTeamScore(RoundEndedEventArgs roundEndedEventArgs)
		{
			if (IsHalfMatch)
			{
				if (roundEndedEventArgs.Winner == Side.CounterTerrorist)
				{
					if (IsOvertime) CurrentOvertime.ScoreTeam2++;
					if (!IsOvertime) Demo.ScoreSecondHalfTeam2++;
					Demo.ScoreTeam2++;
					CurrentRound.WinnerName = Demo.TeamT.Name;
				}
				else
				{
					if (IsOvertime) CurrentOvertime.ScoreTeam1++;
					if (!IsOvertime) Demo.ScoreSecondHalfTeam1++;
					Demo.ScoreTeam1++;
					CurrentRound.WinnerName = Demo.TeamCT.Name;
				}
			}
			else
			{
				if (roundEndedEventArgs.Winner == Side.CounterTerrorist)
				{
					if (IsOvertime) CurrentOvertime.ScoreTeam1++;
					if (!IsOvertime) Demo.ScoreFirstHalfTeam1++;
					Demo.ScoreTeam1++;
					CurrentRound.WinnerName = Demo.TeamCT.Name;
				}
				else
				{
					if (IsOvertime) CurrentOvertime.ScoreTeam2++;
					if (!IsOvertime) Demo.ScoreFirstHalfTeam2++;
					Demo.ScoreTeam2++;
					CurrentRound.WinnerName = Demo.TeamT.Name;
				}
			}
		}
	}
}
