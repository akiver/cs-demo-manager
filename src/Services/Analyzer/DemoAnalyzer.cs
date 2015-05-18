using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Windows;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Events;
using CSGO_Demos_Manager.Models.Source;
using DemoInfo;

namespace CSGO_Demos_Manager.Services.Analyzer
{
	public abstract class DemoAnalyzer
	{
		#region Properties

		public DemoParser Parser { get; set; }

		public Demo Demo { get; set; }

		public Round CurrentRound { get; set; } = new Round();

		public Overtime CurrentOvertime { get; set; } = new Overtime();

		public bool IsMatchStarted { get; set; } = false;

		public bool IsEntryKillDone { get; set; }

		public bool IsOpeningKillDone { get; set; }

		public bool IsHalfMatch { get; set; } = false;

		public bool IsOvertime { get; set; } = false;

		public int MoneySaveAmoutTeam1 { get; set; } = 0;

		public int MoneySaveAmoutTeam2 { get; set; } = 0;

		public int RoundCount { get; set; } = 0;

		public int OvertimeCount { get; set; } = 0;

		public bool IsLastRoundHalf;

		public Dictionary<Player, int> KillsThisRound { get; set; } = new Dictionary<Player, int>();

		public const string TEAM2_NAME = "Team 2";

		public const string TEAM1_NAME = "Team 1";

		private static readonly Regex LocalRegex = new Regex("^[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]+(\\:[0-9]{1,5})?$");

		private static readonly Regex FILENAME_FACEIT_REGEX = new Regex("^[0-9]+_team[a-z0-9-]+-team[a-z0-9-]+_de_[a-z0-9]+\\.dem");

		#endregion

		public abstract Task<Demo> AnalyzeDemoAsync();

		protected abstract void RegisterEvents();

		protected abstract void HandleMatchStarted(object sender, MatchStartedEventArgs e);

		protected abstract void HandleRoundStart(object sender, RoundStartedEventArgs e);

		protected abstract void HandleRoundEnd(object sender, RoundEndedEventArgs e);

		protected abstract void HandlePlayerKilled(object sender, PlayerKilledEventArgs e);

		public static DemoAnalyzer Factory(Demo demo)
		{
			switch (demo.SourceName)
			{
				case "valve":
					return new ValveAnalyzer(demo);
				case "esea":
					return new EseaAnalyzer(demo);
				case "ebot":
				case "faceit":
					return new EbotAnalyzer(demo);
				case "pov":
					return null;
				default:
					return null;
			}
		}

		public static Demo ParseDemoHeader(string pathDemoFile)
		{
			DemoParser parser = new DemoParser(File.OpenRead(pathDemoFile));

			DateTime dateFile = File.GetCreationTime(pathDemoFile);
			string dateAsString = dateFile.ToString("MM/dd/yyyy HH:mm:ss", CultureInfo.InvariantCulture);

			if (Properties.Settings.Default.DateFormatEuropean)
			{
				dateAsString = dateFile.ToString("dd/MM/yyyy HH:mm:ss", CultureInfo.InvariantCulture);
			}

			Demo demo = new Demo
			{
				Name = Path.GetFileName(pathDemoFile),
				Path = pathDemoFile,
				Date = dateAsString
			};

			try
			{
				parser.ParseHeader();
			}
			catch (InvalidDataException)
			{
				// Silently ignore no CSGO demos
				return null;
			}

			DemoHeader header = parser.Header;
			DateTime dateTime = File.GetCreationTime(pathDemoFile);
			int seconds = (int)(dateTime.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;
			demo.Id = header.MapName.Replace("/", "") + seconds + header.SignonLength + header.PlaybackFrames;
			demo.ClientName = header.ClientName;
			demo.Hostname = header.ServerName;
			if (header.PlaybackTicks != 0 && header.PlaybackTime != 0)
			{
				demo.ServerTickrate = header.PlaybackTicks / header.PlaybackTime;
			}
			if (header.PlaybackFrames != 0 && header.PlaybackTime != 0)
			{
				demo.Tickrate = (int)Math.Round((double)header.PlaybackFrames / header.PlaybackTime);
			}
			demo.Duration = header.PlaybackTime;
			demo.MapName = header.MapName;

			// Check if it's a POV demo
			Match match = LocalRegex.Match(header.ServerName);
			if (match.Success)
			{
				demo.Type = "POV";
				demo.Source = Source.Factory("pov");
				return demo;
			}

			// Check for esea demos, appart the filename there is no magic to detect it
			if (demo.Name.Contains("esea"))
			{
				demo.Source = Source.Factory("esea");
				return demo;
			}

			// Check for faceit demos
			// (Before May 2015) Faceit : uses regex - no false positive but could miss some Faceit demo (when premade playing because of custom team name)
			// (May 2015) Faceit : uses hostname
			if (demo.Hostname.Contains("FACEIT.com") || FILENAME_FACEIT_REGEX.Match(demo.Name).Success)
			{
				demo.Source = Source.Factory("faceit");
				return demo;
			}

			// Check for ebot demos
			if (demo.Hostname.Contains("eBot"))
			{
				demo.Source = Source.Factory("ebot");
				return demo;
			}

			// If none of the previous checks matched, we use ValveAnalyzer
			demo.Source = Source.Factory("valve");
			return demo;
		}

		#region Events Handlers

		/// <summary>
		/// Handle each tick
		/// </summary>
		/// <param name="sender"></param>
		/// <param name="e"></param>
		protected void HandleTickDone(object sender, TickDoneEventArgs e)
		{
		}

		/// <summary>
		/// Between round_end and round_officialy_ended events may happened so we update data at round_officialy_end
		/// However at the last round of a match, round officially end isn't raised (on Valve demos)
		/// </summary>
		/// <param name="sender"></param>
		/// <param name="e"></param>
		protected void HandleRoundOfficiallyEnd(object sender, RoundOfficiallyEndedEventArgs e)
		{
			if (!IsMatchStarted) return;
			UpdateKillsCount();
			UpdatePlayerScore();

			if (!IsLastRoundHalf)
			{
				Application.Current.Dispatcher.Invoke(delegate
				{
					Demo.Rounds.Add(CurrentRound);
				});
			}

			if (!IsOvertime)
			{
				if (IsLastRoundHalf)
				{
					IsLastRoundHalf = false;
					IsHalfMatch = !IsHalfMatch;
				}
			}
		}

		protected void HandleFreezetimeEnded(object sender, FreezetimeEndedEventArgs e)
		{
			if (!IsMatchStarted) return;
			// TODO Players can buy after the end of the freezetime, must find an other way
			CurrentRound.EquipementValueTeam1 = Parser.Participants.Where(a => a.Team == Team.CounterTerrorist).Sum(a => a.CurrentEquipmentValue);
			CurrentRound.EquipementValueTeam2 = Parser.Participants.Where(a => a.Team == Team.Terrorist).Sum(a => a.CurrentEquipmentValue);
		}

		protected void HandleBombPlanted(object sender, BombEventArgs e)
		{
			if (!IsMatchStarted) return;

			BombPlantedEvent bombPlantedEvent = new BombPlantedEvent(Parser.IngameTick);
			if (e.Player.SteamID != 0)
			{
				PlayerExtended player = Demo.Players.FirstOrDefault(p => p.SteamId == e.Player.SteamID);
				if (player != null)
				{
					player.BombPlantedCount++;
					bombPlantedEvent.Player = player;
				}
			}
			bombPlantedEvent.Site = e.Site.ToString();
			Demo.BombPlantedCount++;
			Demo.BombPlanted.Add(bombPlantedEvent);
		}

		protected void HandleBombDefused(object sender, BombEventArgs e)
		{
			if (!IsMatchStarted) return;

			BombDefusedEvent bombDefusedEvent = new BombDefusedEvent(Parser.IngameTick);
			if (e.Player.SteamID != 0)
			{
				PlayerExtended player = Demo.Players.FirstOrDefault(p => p.SteamId == e.Player.SteamID);
				if (player != null)
				{
					player.BombDefusedCount++;
					bombDefusedEvent.Player = player;
				}
			}
			CurrentRound.BombDefusedCount++;
			Demo.BombDefusedCount++;
			Demo.BombDefused.Add(bombDefusedEvent);
		}

		protected void HandleBombExploded(object sender, BombEventArgs e)
		{
			if (!IsMatchStarted) return;

			CurrentRound.BombExplodedCount++;
			Demo.BombExplodedCount++;
		}

		protected void HandleWeaponFired(object sender, WeaponFiredEventArgs e)
		{
			if (!IsMatchStarted) return;
			if (e.Shooter == null) return;

			WeaponFire shoot = new WeaponFire(Parser.IngameTick)
			{
				X = e.Shooter.Position.X,
				Y = e.Shooter.Position.Y,
				Z = e.Shooter.Position.Z
			};
			Demo.WeaponFired.Add(shoot);
		}

		protected void HandleFireNadeEnded(object sender, FireEventArgs e)
		{
			if (!IsMatchStarted) return;

			switch (e.NadeType)
			{
				case EquipmentElement.Incendiary:
				case EquipmentElement.Molotov:
					MolotovFireEndedEvent molotovEvent = new MolotovFireEndedEvent(Parser.IngameTick)
					{
						Point = new HeatmapPoint
						{
							X = e.Position.X,
							Y = e.Position.Y
						}
					};
					// Thrower is not indicated every time
					if (e.ThrownBy != null)
					{
						molotovEvent.Thrower = Demo.Players.FirstOrDefault(player => player.SteamId == e.ThrownBy.SteamID);
					}
					CurrentRound.MolotovsThrowed.Add(molotovEvent);
					break;
			}
		}

		protected void HandleExplosiveNadeExploded(object sender, GrenadeEventArgs e)
		{
			if (!IsMatchStarted) return;
			if (e.ThrownBy == null) return;

			ExplosiveNadeExplodedEvent explosiveEvent = new ExplosiveNadeExplodedEvent(Parser.IngameTick)
			{
				Point = new HeatmapPoint
				{
					X = e.Position.X,
					Y = e.Position.Y
				},
				Thrower = Demo.Players.FirstOrDefault(player => player.SteamId == e.ThrownBy.SteamID)
			};
			CurrentRound.ExplosiveGrenadesExploded.Add(explosiveEvent);
		}

		protected void HandleFlashNadeExploded(object sender, FlashEventArgs e)
		{
			if (!IsMatchStarted) return;
			if (e.ThrownBy == null) return;

			FlashbangExplodedEvent flashbangEvent = new FlashbangExplodedEvent(Parser.IngameTick)
			{
				Point = new HeatmapPoint
				{
					X = e.Position.X,
					Y = e.Position.Y
				},
				Thrower = Demo.Players.FirstOrDefault(player => player.SteamId == e.ThrownBy.SteamID)
			};
			if (e.FlashedPlayers != null)
			{
				foreach (Player player in e.FlashedPlayers)
				{
					PlayerExtended playerExtended = Demo.Players.FirstOrDefault(p => p.SteamId == player.SteamID);
					if (playerExtended != null)
					{
						flashbangEvent.FlashedPlayers.Add(playerExtended);
					}
				}
			}
			CurrentRound.FlashbangsExploded.Add(flashbangEvent);
		}

		protected void HandleSmokeNadeStarted(object sender, SmokeEventArgs e)
		{
			if (!IsMatchStarted) return;
			if (e.ThrownBy == null) return;

			SmokeNadeStartedEvent smokeEvent = new SmokeNadeStartedEvent(Parser.IngameTick)
			{
				Point = new HeatmapPoint
				{
					X = e.Position.X,
					Y = e.Position.Y
				},
				Thrower = Demo.Players.FirstOrDefault(player => player.SteamId == e.ThrownBy.SteamID)
			};
			CurrentRound.SmokesStarted.Add(smokeEvent);
		}

		protected void HandleRoundMvp(object sender, RoundMVPEventArgs e)
		{
			if (!IsMatchStarted) return;

			if (e.Player.SteamID == 0) return;
			PlayerExtended playerMvp = Demo.Players.FirstOrDefault(player => player.SteamId == e.Player.SteamID);
			if (playerMvp != null) playerMvp.RoundMvpCount++;
		}

		#endregion

		#region Process

		/// <summary>
		/// Update kills count for each player, current round and demo
		/// </summary>
		protected void UpdateKillsCount()
		{
			foreach (KeyValuePair<Player, int> pair in KillsThisRound)
			{
				// Keep individual kills for each players
				PlayerExtended player = Demo.Players.FirstOrDefault(p => p.SteamId == pair.Key.SteamID);
				if (player == null) continue;
				switch (pair.Value)
				{
					case 1:
						player.OnekillCount++;
						Demo.OneKillCount++;
						CurrentRound.OneKillCount++;
						break;
					case 2:
						player.TwokillCount++;
						Demo.TwoKillCount++;
						CurrentRound.TwoKillCount++;
						break;
					case 3:
						player.ThreekillCount++;
						Demo.ThreeKillCount++;
						CurrentRound.ThreeKillCount++;
						break;
					case 4:
						player.FourKillCount++;
						Demo.FourKillCount++;
						CurrentRound.FourKillCount++;
						break;
					case 5:
						player.FiveKillCount++;
						Demo.FiveKillCount++;
						CurrentRound.FiveKillCount++;
						break;
				}
			}
		}

		protected void CreateNewRound()
		{
			CurrentRound = new Round
			{
				Tick = Parser.IngameTick,
				Number = ++RoundCount
			};

			// Sometimes parser return wrong money values on 1st round of side
			if (CurrentRound.Number == 1 || CurrentRound.Number == 16)
			{
				CurrentRound.StartMoneyTeam1 = 4000;
				CurrentRound.StartMoneyTeam2 = 4000;
			}
			else
			{
				CurrentRound.StartMoneyTeam1 = Parser.Participants.Where(a => a.Team == Team.CounterTerrorist).Sum(a => a.Money);
				CurrentRound.StartMoneyTeam2 = Parser.Participants.Where(a => a.Team == Team.Terrorist).Sum(a => a.Money);
			}

			IsEntryKillDone = false;
			IsOpeningKillDone = false;

			KillsThisRound.Clear();

			// Nobody is controlling a BOT at the beginning of a round
			foreach (PlayerExtended pl in Demo.Players)
			{
				pl.IsAlive = true;
				pl.OpponentClutchCount = 0;
				pl.HasEntryKill = false;
				pl.HasOpeningKill = false;
				pl.IsControllingBot = false;
			}
		}

		/// <summary>
		/// Update the players score (displayed on the scoreboard)
		/// </summary>
		protected void UpdatePlayerScore()
		{
			// Update players score
			foreach (Player player in Parser.PlayingParticipants)
			{
				PlayerExtended pl = Demo.Players.FirstOrDefault(p => p.SteamId == player.SteamID);
				if (pl != null)
				{
					pl.Score = player.AdditionaInformations.Score;
				}
			}
		}

		/// <summary>
		/// Swap players team
		/// </summary>
		protected void SwapTeams()
		{
			foreach (PlayerExtended pl in Demo.Players)
			{
				pl.Team = pl.Team == Team.Terrorist ? Team.CounterTerrorist : Team.Terrorist;
			}
		}

		/// <summary>
		/// Check if there is any clutch situation and if so add clutch to player
		/// </summary>
		protected void ProcessClutches()
		{
			int terroristAliveCount = Demo.Players.Count(p => p.Team == Team.Terrorist && p.IsAlive);
			int counterTerroristAliveCount = Demo.Players.Count(p => p.Team == Team.CounterTerrorist && p.IsAlive);
			PlayerExtended playerInClutch = null;

			// T loose his clutch
			if (terroristAliveCount == 0)
			{
				playerInClutch = Demo.Players.FirstOrDefault(p => p.Team == Team.CounterTerrorist && p.IsAlive && p.OpponentClutchCount != 0);
			}

			// CT loose his clutch
			if (counterTerroristAliveCount == 0)
			{
				playerInClutch = Demo.Players.FirstOrDefault(p => p.Team == Team.Terrorist && p.IsAlive && p.OpponentClutchCount != 0);
			}

			if (playerInClutch != null)
			{
				// CT win his clutch
				switch (playerInClutch.OpponentClutchCount)
				{
					case 1:
						playerInClutch.Clutch1V1Count++;
						break;
					case 2:
						playerInClutch.Clutch1V2Count++;
						break;
					case 3:
						playerInClutch.Clutch1V3Count++;
						break;
					case 4:
						playerInClutch.Clutch1V4Count++;
						break;
					case 5:
						playerInClutch.Clutch1V5Count++;
						break;
				}
				return;
			}

			if (terroristAliveCount == 1)
			{
				// Set the number of opponent in his clutch
				PlayerExtended terroristInClutch = Demo.Players.FirstOrDefault(p => p.Team == Team.Terrorist && p.IsAlive);
				if (terroristInClutch != null && terroristInClutch.OpponentClutchCount == 0)
				{
					terroristInClutch.OpponentClutchCount = Demo.Players.Count(p => p.Team == Team.CounterTerrorist && p.IsAlive);
				}
			}

			if (counterTerroristAliveCount == 1)
			{
				PlayerExtended counterTerroristInClutch = Demo.Players.FirstOrDefault(p => p.Team == Team.CounterTerrorist && p.IsAlive);
				if (counterTerroristInClutch != null && counterTerroristInClutch.OpponentClutchCount == 0)
				{
					counterTerroristInClutch.OpponentClutchCount = Demo.Players.Count(p => p.Team == Team.Terrorist && p.IsAlive);
				}
			}
		}

		protected void ProcessOpenAndEntryKills(KillEvent killEvent)
		{
			if (killEvent.DeathPerson == null || killEvent.Killer == null) return;

			if (IsEntryKillDone) return;

			if (IsOpeningKillDone) return;

			if (killEvent.Killer.Team == Team.Terrorist)
			{
				// This is an entry kill
				Application.Current.Dispatcher.Invoke(delegate
				{
					killEvent.Killer.HasEntryKill = true;
					killEvent.Killer.HasOpeningKill = true;

					CurrentRound.EntryKillEvent = new EntryKillEvent(Parser.IngameTick)
					{
						KilledName = killEvent.DeathPerson.Name,
						KilledSteamId = killEvent.DeathPerson.SteamId,
						KilledTeam = killEvent.DeathPerson.Team,
						KillerName = killEvent.Killer.Name,
						KillerSteamId = killEvent.Killer.SteamId,
						KillerTeam = killEvent.Killer.Team,
						Weapon = new Weapon()
						{
							Name = killEvent.Weapon.Name,
							AmmoInMagazine = killEvent.Weapon.AmmoInMagazine,
							ReserveAmmo = killEvent.Weapon.ReserveAmmo
						}
					};
					CurrentRound.OpenKillEvent = new OpenKillEvent(Parser.IngameTick)
					{
						KilledName = killEvent.DeathPerson.Name,
						KilledSteamId = killEvent.DeathPerson.SteamId,
						KilledTeam = killEvent.DeathPerson.Team,
						KillerName = killEvent.Killer.Name,
						KillerSteamId = killEvent.Killer.SteamId,
						KillerTeam = killEvent.Killer.Team,
						Weapon = new Weapon()
						{
							Name = killEvent.Weapon.Name,
							AmmoInMagazine = killEvent.Weapon.AmmoInMagazine,
							ReserveAmmo = killEvent.Weapon.ReserveAmmo
						}
					};
					IsEntryKillDone = true;
					IsOpeningKillDone = true;
				});
			}
			else
			{
				// CT done the kill , it's an open kill
				CurrentRound.OpenKillEvent = new OpenKillEvent(Parser.IngameTick)
				{
					KilledName = killEvent.DeathPerson.Name,
					KilledSteamId = killEvent.DeathPerson.SteamId,
					KilledTeam = killEvent.DeathPerson.Team,
					KillerName = killEvent.Killer.Name,
					KillerSteamId = killEvent.Killer.SteamId,
					KillerTeam = killEvent.Killer.Team,
					Weapon = new Weapon()
					{
						Name = killEvent.Weapon.Name,
						AmmoInMagazine = killEvent.Weapon.AmmoInMagazine,
						ReserveAmmo = killEvent.Weapon.ReserveAmmo
					}
				};
				killEvent.Killer.HasOpeningKill = true;
				IsOpeningKillDone = true;
			}
		}

		/// <summary>
		/// Update the teams score and current round name
		/// </summary>
		/// <param name="roundEndedEventArgs"></param>
		protected void UpdateTeamScore(RoundEndedEventArgs roundEndedEventArgs)
		{
			if (IsOvertime)
			{
				if (IsHalfMatch)
				{
					if (roundEndedEventArgs.Winner == Team.Terrorist)
					{
						CurrentOvertime.ScoreTeam2++;
						Demo.ScoreTeam2++;
						CurrentRound.WinnerClanName = !string.IsNullOrWhiteSpace(Demo.ClanTagNameTeam2) ? Demo.ClanTagNameTeam2 : TEAM2_NAME;
					}
					else
					{
						CurrentOvertime.ScoreTeam1++;
						Demo.ScoreTeam1++;
						CurrentRound.WinnerClanName = !string.IsNullOrWhiteSpace(Demo.ClanTagNameTeam1) ? Demo.ClanTagNameTeam1 : TEAM1_NAME;
					}
				}
				else
				{
					if (roundEndedEventArgs.Winner == Team.CounterTerrorist)
					{
						CurrentOvertime.ScoreTeam2++;
						Demo.ScoreTeam2++;
						CurrentRound.WinnerClanName = !string.IsNullOrWhiteSpace(Demo.ClanTagNameTeam2) ? Demo.ClanTagNameTeam2 : TEAM2_NAME;
					}
					else
					{
						CurrentOvertime.ScoreTeam1++;
						Demo.ScoreTeam1++;
						CurrentRound.WinnerClanName = !string.IsNullOrWhiteSpace(Demo.ClanTagNameTeam1) ? Demo.ClanTagNameTeam1 : TEAM1_NAME;
					}
				}
			}
			else
			{
				if (IsHalfMatch)
				{
					if (roundEndedEventArgs.Winner == Team.Terrorist)
					{
						Demo.ScoreSecondHalfTeam1++;
						Demo.ScoreTeam1++;
						CurrentRound.WinnerClanName = !string.IsNullOrWhiteSpace(Demo.ClanTagNameTeam1) ? Demo.ClanTagNameTeam1 : TEAM1_NAME;
					}
					else
					{
						Demo.ScoreSecondHalfTeam2++;
						Demo.ScoreTeam2++;
						CurrentRound.WinnerClanName = !string.IsNullOrWhiteSpace(Demo.ClanTagNameTeam2) ? Demo.ClanTagNameTeam2 : TEAM2_NAME;
					}
				}
				else
				{
					if (roundEndedEventArgs.Winner == Team.CounterTerrorist)
					{
						Demo.ScoreFirstHalfTeam1++;
						Demo.ScoreTeam1++;
						CurrentRound.WinnerClanName = !string.IsNullOrWhiteSpace(Demo.ClanTagNameTeam1) ? Demo.ClanTagNameTeam1 : TEAM1_NAME;
					}
					else
					{
						Demo.ScoreFirstHalfTeam2++;
						Demo.ScoreTeam2++;
						CurrentRound.WinnerClanName = !string.IsNullOrWhiteSpace(Demo.ClanTagNameTeam2) ? Demo.ClanTagNameTeam2 : TEAM2_NAME;
					}
				}
			}
		}

		#endregion
	}
}
