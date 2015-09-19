using System;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
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
		// Counter of player team swap (used detect end of a half)
		private int _playerTeamCount;

		private bool _isMatchStartedOccured = false;

		private bool _isTeamsInitialized = false;

		/// <summary>
		/// Used to make some specific check on Faceit demos and avoid some on eBot demos
		/// </summary>
		private bool _isFaceit = false;

		private readonly Regex _scoreRegex = new Regex("^eBot: (.*) (?<score1>[0-9]+) - (?<score2>[0-9]+) (.*)$");

		private readonly Regex _faceitScoreRegex = new Regex("^ \\[ANNA\\^\\] (.*) \\[(?<score1>[0-9]+) - (?<score2>[0-9]+)\\] (.*)$");

		private readonly Regex _endMatchRegex = new Regex("^eBot: (.*) win(.*)$");

		private const string FACEIT_LIVE = " [ANNA^] LIVE!";

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
			Parser.WinPanelMatch += HandleWinPanelMatch;
			Parser.SmokeNadeEnded += HandleSmokeNadeEnded;
			Parser.FireNadeStarted += HandleFireNadeStarted;
			Parser.DecoyNadeStarted += HandleDecoyNadeStarted;
			Parser.DecoyNadeEnded += HandleDecoyNadeEnded;
			Parser.PlayerHurt += HandlePlayerHurted;
			Parser.SayText += HandleSayText;
		}

		public async override Task<Demo> AnalyzeDemoAsync()
		{
			Parser.ParseHeader();

			await Task.Run(() => Parser.ParseToEnd());

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

			if (AnalyzePlayersPosition)
			{
				LastPlayersFireEndedMolotov.Clear();
			}

			return Demo;
		}

		protected new void HandleRoundOfficiallyEnd(object sender, RoundOfficiallyEndedEventArgs e)
		{
			base.HandleRoundOfficiallyEnd(sender, e);
			if (IsOvertime && IsLastRoundHalf) IsHalfMatch = true;
		}

		protected new void HandleWeaponFired(object sender, WeaponFiredEventArgs e)
		{
			if (!_isTeamsInitialized) return;
			base.HandleWeaponFired(sender, e);
		}

		protected void HandlePlayerTeam(object sender, PlayerTeamEventArgs e)
		{
			if (!IsMatchStarted) return;
			if (e.Silent) _playerTeamCount++;
		}

		protected void HandleLastRoundHalf(object sender, LastRoundHalfEventArgs e)
		{
			if (!IsMatchStarted) return;
			if (_isFaceit && IsOvertime) IsLastRoundHalf = true;
		}

		protected void HandleSayText(object sender, SayTextEventArgs e)
		{
			// cleanup text
			e.Text = Regex.Replace(e.Text, @"[\u0001\u0005\u0004]", string.Empty);

			// Beginning of the match
			if (e.Text == EBOT_LIVE || e.Text == FACEIT_LIVE)
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
				// End of the match may have an overtime, init the 1st one
				if (scoreTotal == 30)
				{
					// Don't stop the match for Faceit demos because there isn't warmup between end of the match and OT
					if(!scoreUpdateFaceit.Success) IsMatchStarted = false;
					// Start the OT
					IsOvertime = true;
					IsHalfMatch = false;
					CurrentOvertime = new Overtime
					{
						Number = ++OvertimeCount
					};
				}
				return;
			}

			// End of the match (OT or not)
			Match matchEnd = _endMatchRegex.Match(e.Text);
			if (matchEnd.Success)
			{
				IsMatchStarted = false;
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
					IsHalfMatch = Demo.Overtimes.Any();
				}

				// announce the beginning of the 2nd OT side
				if (e.Text == BEGIN_SECOND_SIDE_OVERTIME)
				{
					IsMatchStarted = true;
					IsHalfMatch = !Demo.Overtimes.Any();
				}
			}
		}

		protected void HandleWinPanelMatch(object sender, WinPanelMatchEventArgs e)
		{
			Application.Current.Dispatcher.Invoke(delegate
			{
				if (!IsOvertime || !_isFaceit) Demo.Rounds.Add(CurrentRound);
				if(IsOvertime) Demo.Overtimes.Add(CurrentOvertime);
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
			if (_playerTeamCount > 8) IsMatchStarted = true;
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

			if (Demo.ScoreTeam1 + Demo.ScoreTeam2 == 15) IsHalfMatch = true;

			if(!IsOvertime) return;

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

				if (IsLastRoundHalf) Demo.Rounds.Add(CurrentRound);

				var playerWithEntryKill = Demo.Players.FirstOrDefault(p => p.HasEntryKill);
				playerWithEntryKill?.EntryKills.Add(CurrentRound.EntryKillEvent);

				var playerWithOpeningKill = Demo.Players.FirstOrDefault(p => p.HasOpeningKill);
				playerWithOpeningKill?.OpeningKills.Add(CurrentRound.OpenKillEvent);
			});
		}

		protected override void HandlePlayerKilled(object sender, PlayerKilledEventArgs e)
		{
			if (!IsMatchStarted) return;
			if (e.Killer == null || e.Victim == null) return;

			KillEvent killEvent = new KillEvent(Parser.IngameTick)
			{
				Weapon = new Weapon(e.Weapon),
				DeathPerson = Demo.Players.FirstOrDefault(player => player.SteamId == e.Victim.SteamID)
			};

			// Set the player killed as dead
			if (killEvent.DeathPerson != null) killEvent.DeathPerson.IsAlive = false;

			if (e.Assister != null)
			{
				killEvent.Assister = Demo.Players.FirstOrDefault(player => player.SteamId == e.Assister.SteamID);
			}

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

			if (AnalyzeHeatmapPoint)
			{
				killEvent.Point = new HeatmapPoint
				{
					X = e.Victim.Position.X,
					Y = e.Victim.Position.Y,
					Round = CurrentRound,
					Player = killEvent.Killer,
					Team = e.Killer.Team
				};
			}

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