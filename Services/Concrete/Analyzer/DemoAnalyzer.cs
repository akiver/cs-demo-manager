using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using Core.Models;
using Core.Models.Events;
using Core.Models.protobuf;
using Core.Models.Source;
using DemoInfo;
using ProtoBuf;
using Side = DemoInfo.Team;
using Player = Core.Models.Player;
using Team = Core.Models.Team;

namespace Services.Concrete.Analyzer
{
	public abstract class DemoAnalyzer
	{
		#region Properties

		public DemoParser Parser { get; set; }

		public Demo Demo { get; set; }

		public Round CurrentRound { get; set; } = new Round();
		public Overtime CurrentOvertime { get; set; } = new Overtime();
		public ClutchEvent CurrentClutch { get; set; }

		public bool IsMatchStarted { get; set; } = false;
		public bool IsFirstKillOccured { get; set; }
		public bool IsHalfMatch { get; set; } = false;
		public bool IsOvertime { get; set; } = false;
		public bool IsLastRoundHalf { get; set; }
		public bool IsSwapTeamRequired { get; set; } = false;
		public bool IsRoundEndOccured { get; set; }
		/// <summary>
		/// Used to detect when the first shot occured to be able to have the right equipement money value
		/// I use this because the event buytime_ended isn't raised everytime
		/// </summary>
		public bool IsFirstShotOccured { get; set; } = false;
		public bool IsFreezetime { get; set; } = false;
		public int MoneySaveAmoutTeam1 { get; set; } = 0;
		public int MoneySaveAmoutTeam2 { get; set; } = 0;
		public int RoundCount { get; set; } = 0;
		public int OvertimeCount { get; set; } = 0;

		public Dictionary<DemoInfo.Player, int> KillsThisRound { get; set; } = new Dictionary<DemoInfo.Player, int>();

		private Player _playerInClutch1 = null;
		private Player _playerInClutch2 = null;

		private static readonly Regex LocalRegex = new Regex("^[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]+(\\:[0-9]{1,5})?$");
		private static readonly Regex FILENAME_FACEIT_REGEX = new Regex("^[0-9]+_team[a-z0-9-]+-team[a-z0-9-]+_de_[a-z0-9]+\\.dem");
		private static readonly Regex FILENAME_EBOT_REGEX = new Regex("^([0-9]*)_(.*?)-(.*?)_(.*?)(.dem)$");

		public bool AnalyzePlayersPosition { get; set; } = false;
		public bool AnalyzeFlashbang { get; set; } = false;

		// HTLV rating variables http://www.hltv.org/?pageid=242&eventid=0
		const double AVERAGE_KPR = 0.679; // average kills per round
		const double AVERAGE_SPR = 0.317; // average survived rounds per round
		const double AVERAGE_RMK = 1.277; // average value calculated from rounds with multiple kills

		// Money awards
		private const int LOSS_ROW_1 = 1400;
		private const int LOSS_ROW_2 = 1900;
		private const int LOSS_ROW_3 = 2400;
		private const int LOSS_ROW_4 = 2900;
		private const int LOSS_ROW_5 = 3400;
		private const int WIN_BOMB_TARGET = 3500;
		private const int WIN_BOMB_DEFUSED = 3500;
		private const int WIN_TIME_OVER = 3250;
		private const int WIN_ELIMINATION = 3250;
		private const int BOMB_PLANTED_BONUS = 800;
		private const int TEAMKILL = -300;

		private const int ESEA_ASSIST_THRESHOLD = 50;

		/// <summary>
		/// As molotov thrower isn't networked eveytime, this 3 queues are used to know who thrown a moloto
		/// </summary>
		public readonly Queue<Player> LastPlayersThrownMolotov = new Queue<Player>();

		public readonly Queue<Player> LastPlayersFireStartedMolotov = new Queue<Player>();

		public readonly Queue<Player> LastPlayersFireEndedMolotov = new Queue<Player>();

		/// <summary>
		/// Last player who thrown a flashbang, used for flashbangs stats
		/// </summary>
		public Player LastPlayerExplodedFlashbang { get; set; }

		public Queue<Player> PlayersFlashQueue = new Queue<Player>();

		#endregion

		public abstract Task<Demo> AnalyzeDemoAsync(CancellationToken token);

		protected abstract void RegisterEvents();

		protected abstract void HandleMatchStarted(object sender, MatchStartedEventArgs e);
		protected abstract void HandleRoundStart(object sender, RoundStartedEventArgs e);

		public static DemoAnalyzer Factory(Demo demo)
		{
			switch (demo.SourceName)
			{
				case "valve":
				case "popflash":
					return new ValveAnalyzer(demo);
				case "esea":
					return new EseaAnalyzer(demo);
				case "ebot":
				case "faceit":
					return new EbotAnalyzer(demo);
				case "cevo":
					return new CevoAnalyzer(demo);
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
			Demo demo = new Demo
			{
				Name = Path.GetFileName(pathDemoFile),
				Path = pathDemoFile,
				Date = dateFile
			};

			try
			{
				parser.ParseHeader();
			}
			catch (Exception)
			{
				// Silently ignore no CSGO demos or unreadable file
				return null;
			}

			DemoHeader header = parser.Header;
			DateTime dateTime = File.GetCreationTime(pathDemoFile);
			int seconds = (int)(dateTime.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;
			demo.Id = header.MapName.Replace("/", "") + "_" + seconds + header.SignonLength + header.PlaybackFrames;
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
			demo.Source = DetermineDemoSource(demo, header);
			demo.Ticks = header.PlaybackTicks;

			// Read .info file to get the real match date
			string infoFilePath = demo.Path + ".info";
			if (File.Exists(infoFilePath))
			{
				using (FileStream file = File.OpenRead(infoFilePath))
				{
					try
					{
						CDataGCCStrike15_v2_MatchInfo infoMsg = Serializer.Deserialize<CDataGCCStrike15_v2_MatchInfo>(file);
						DateTime date = new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc);
						demo.Date = date.AddSeconds(infoMsg.matchtime).ToLocalTime();
					}
					catch (Exception)
					{
						// silently ignore old .info files
						// Maybe add the old message to handle it?
					}
				}
			}

			return demo;
		}

		private static Source DetermineDemoSource(Demo demo, DemoHeader header)
		{
			// Check if it's a POV demo
			Match match = LocalRegex.Match(header.ServerName);
			if (match.Success || header.ServerName.Contains("localhost"))
			{
				demo.Type = "POV";
				return Source.Factory("pov");
			}

			// Check for esea demos, appart the filename there is no magic to detect it
			if (demo.Name.Contains("esea", StringComparison.OrdinalIgnoreCase))
			{
				return Source.Factory("esea");
			}

			// Check for faceit demos
			// (Before May 2015) Faceit : uses regex - no false positive but could miss some Faceit demo (when premade playing because of custom team name)
			// (May 2015) Faceit : uses hostname
			if (demo.Hostname.Contains("faceit", StringComparison.OrdinalIgnoreCase)
				|| FILENAME_FACEIT_REGEX.Match(demo.Name).Success)
			{
				return Source.Factory("faceit");
			}

			// Check for cevo demos
			if (demo.Hostname.Contains("cevo", StringComparison.OrdinalIgnoreCase))
			{
				return Source.Factory("cevo");
			}

			// Check for ebot demos
			if (demo.Hostname.Contains("ebot", StringComparison.OrdinalIgnoreCase)
				|| FILENAME_EBOT_REGEX.Match(demo.Name).Success)
			{
				return Source.Factory("ebot");
			}

			if (demo.Name.Contains("popflash", StringComparison.OrdinalIgnoreCase)
				|| demo.Hostname.Contains("popflash", StringComparison.OrdinalIgnoreCase))
			{
				return Source.Factory("popflash");
			}

			// If none of the previous checks matched, we use ValveAnalyzer
			return Source.Factory("valve");
		}

		#region Events Handlers

		/// <summary>
		/// Handle each tick
		/// </summary>
		/// <param name="sender"></param>
		/// <param name="e"></param>
		protected void HandleTickDone(object sender, TickDoneEventArgs e)
		{
			if (!IsMatchStarted || IsFreezetime) return;

			if (AnalyzeFlashbang)
			{
				foreach (DemoInfo.Player player in Parser.PlayingParticipants)
				{
					Player pl = Demo.Players.FirstOrDefault(p => p.SteamId == player.SteamID);
					if (pl != null && player.FlashDuration >= pl.FlashDurationTemp)
					{
						PlayerBlindedEvent playerBlindedEvent = new PlayerBlindedEvent(Parser.CurrentTick, Parser.CurrentTime)
						{
							ThrowerSteamId = LastPlayerExplodedFlashbang.SteamId,
							ThrowerName = LastPlayerExplodedFlashbang.Name,
							ThrowerTeamName = LastPlayerExplodedFlashbang.TeamName,
							VictimSteamId = pl.SteamId,
							VictimName = pl.Name,
							VictimTeamName = pl.TeamName,
							RoundNumber = CurrentRound.Number,
							Duration = player.FlashDuration - pl.FlashDurationTemp
						};
						Demo.PlayerBlinded.Add(playerBlindedEvent);
					}
				}
				AnalyzeFlashbang = false;
			}

			if (!AnalyzePlayersPosition) return;

			if (Parser.PlayingParticipants.Any())
			{
				if (Demo.Players.Any())
				{
					// Reset bomber
					foreach (Player player in Demo.Players)
					{
						player.HasBomb = false;
					}

					// Update players position
					foreach (DemoInfo.Player player in Parser.PlayingParticipants)
					{
						if (!player.IsAlive) continue;
						Player pl = Demo.Players.FirstOrDefault(p => p.SteamId == player.SteamID);
						if (pl == null || pl.SteamId == 0) continue;

						// Set the bomber
						if (player.Weapons.FirstOrDefault(w => w.Weapon == EquipmentElement.Bomb) != null) pl.HasBomb = true;

						PositionPoint positionPoint = new PositionPoint
						{
							X = player.Position.X,
							Y = player.Position.Y,
							RoundNumber = CurrentRound.Number,
							Team = player.Team,
							PlayerName = player.Name,
							PlayerSteamId = player.SteamID,
							PlayerHasBomb = pl.HasBomb
						};
						Demo.PositionPoints.Add(positionPoint);
					}
				}
			}
		}

		/// <summary>
		/// killer == null => world
		/// killer.SteamID == 0 => BOT
		/// if a player is killed by bomb explosion, killer == planter
		/// </summary>
		/// <param name="sender"></param>
		/// <param name="e"></param>
		protected void HandlePlayerKilled(object sender, PlayerKilledEventArgs e)
		{
			if (!IsMatchStarted || e.Victim == null) return;

			Player killed = Demo.Players.FirstOrDefault(player => player.SteamId == e.Victim.SteamID);
			if (killed == null) return;
			Weapon weapon = Weapon.WeaponList.FirstOrDefault(w => w.Element == e.Weapon.Weapon);
			if (weapon == null) return;
			Player killer = null;
			Player assister = null;

			KillEvent killEvent = new KillEvent(Parser.IngameTick, Parser.CurrentTime)
			{
				Weapon = weapon,
				KillerSteamId = e.Killer?.SteamID ?? 0,
				KillerName = e.Killer?.Name ?? string.Empty,
				KillerSide = e.Killer?.Team ?? Side.Spectate,
				KilledSide = e.Victim.Team,
				KilledSteamId = e.Victim.SteamID,
				KilledName = e.Victim.Name,
				KillerVelocityX = e.Killer?.Velocity.X ?? 0,
				KillerVelocityY = e.Killer?.Velocity.Y ?? 0,
				KillerVelocityZ = e.Killer?.Velocity.Z ?? 0,
				RoundNumber = CurrentRound.Number,
				IsHeadshot = e.Headshot,
				IsKillerCrouching = e.Killer?.IsDucking ?? false,
				Point = new KillHeatmapPoint
				{
					KillerX = e.Killer?.Position.X ?? 0,
					KillerY = e.Killer?.Position.Y ?? 0,
					VictimX = e.Victim.Position.X,
					VictimY = e.Victim.Position.Y
				}
			};

			killed.IsAlive = false;
			if (e.Killer != null) killer = Demo.Players.FirstOrDefault(player => player.SteamId == e.Killer.SteamID);
			if (killer != null )
			{
				// add kill to the current round only if it's not a TK / suicide
				if (e.Killer.Team != e.Victim.Team)
				{
					if (!KillsThisRound.ContainsKey(e.Killer))
					{
						KillsThisRound[e.Killer] = 0;
					}
					KillsThisRound[e.Killer]++;
				}

				// add money reward only if it's not a suicide
				if (e.Victim.SteamID != killer.SteamId)
				{
					if (!killer.RoundsMoneyEarned.ContainsKey(CurrentRound.Number))
						killer.RoundsMoneyEarned[CurrentRound.Number] = weapon.KillAward;
					else
						killer.RoundsMoneyEarned[CurrentRound.Number] += weapon.KillAward;
				}

				// if it's a TK, the player lost 300$
				if (e.Killer.Team == e.Victim.Team)
				{
					if (killer.RoundsMoneyEarned.ContainsKey(CurrentRound.Number))
						killer.RoundsMoneyEarned[CurrentRound.Number] += TEAMKILL;
				}
				ProcessTradeKill(killEvent);
			}

			if (e.Assister != null)
			{
				if (e.Killer != null && this is EseaAnalyzer)
				{
					Dictionary<long, int> damagesPerPlayer = new Dictionary<long, int>();
					foreach (PlayerHurtedEvent hurtedEvent in CurrentRound.PlayersHurted)
					{
						if (hurtedEvent.HurtedSteamId == e.Victim.SteamID && hurtedEvent.AttackerSteamId != e.Killer.SteamID)
						{
							if (!damagesPerPlayer.ContainsKey(hurtedEvent.AttackerSteamId))
								damagesPerPlayer[hurtedEvent.AttackerSteamId] = hurtedEvent.HealthDamage;
							else
								damagesPerPlayer[hurtedEvent.AttackerSteamId] += hurtedEvent.HealthDamage;
						}
					}
					if (damagesPerPlayer.Any())
					{
						KeyValuePair<long, int> higherDamageDone = damagesPerPlayer.FirstOrDefault(d => d.Value == damagesPerPlayer.Values.Max());
						if (higherDamageDone.Value > ESEA_ASSIST_THRESHOLD)
						{
							assister = Demo.Players.FirstOrDefault(player => player.SteamId == higherDamageDone.Key);
						}
					}
				}
				else
				{
					assister = Demo.Players.FirstOrDefault(player => player.SteamId == e.Assister.SteamID);
				}
			}

			ProcessOpenAndEntryKills(killEvent);
			ProcessClutches();
			ProcessPlayersRating();

			if (assister != null)
			{
				killEvent.AssisterSteamId = assister.SteamId;
				killEvent.AssisterName = assister.Name;
				assister.Assists.Add(killEvent);
			}
			Demo.Kills.Add(killEvent);
			CurrentRound.Kills.Add(killEvent);
			killer?.Kills.Add(killEvent);
			killed.Deaths.Add(killEvent);

			if (AnalyzePlayersPosition)
			{
				PositionPoint positionPoint = new PositionPoint
				{
					X = e.Victim.Position.X,
					Y = e.Victim.Position.Y,
					PlayerName = e.Killer?.Name ?? string.Empty,
					PlayerSteamId = e.Killer?.SteamID ?? 0,
					Team = e.Killer?.Team ?? Side.Spectate,
					Event = killEvent,
					RoundNumber = CurrentRound.Number
				};
				Demo.PositionPoints.Add(positionPoint);
			}
		}

		protected void HandleRoundEnd(object sender, RoundEndedEventArgs e)
		{
			IsRoundEndOccured = true;
			if (!IsMatchStarted) return;

			CurrentRound.EndReason = e.Reason;
			CurrentRound.EndTimeSeconds = Parser.CurrentTime;
			CurrentRound.WinnerSide = e.Winner;
			UpdateTeamScore(e);
			ProcessRoundEndReward(e);
			if (e.Reason == RoundEndReason.CTSurrender)
			{
				Demo.Surrender = IsHalfMatch ? Demo.TeamT : Demo.TeamCT;
			}
			else if (e.Reason == RoundEndReason.TerroristsSurrender)
			{
				Demo.Surrender = IsHalfMatch ? Demo.TeamCT : Demo.TeamT;
			}

			Application.Current.Dispatcher.Invoke(delegate
			{
				// update round won status for entry kills / hold kills
				if (e.Winner == CurrentRound.EntryKillEvent?.KillerSide) CurrentRound.EntryKillEvent.HasWonRound = true;
				if (e.Winner == CurrentRound.EntryHoldKillEvent?.KillerSide) CurrentRound.EntryHoldKillEvent.HasWonRound = true;
				List<Player> playerWithEntryKill = Demo.Players.Where(p => p.HasEntryKill).ToList();
				foreach (Player player in playerWithEntryKill)
				{
					if (player.Side == e.Winner) player.EntryKills.Last().HasWonRound = true;
				}
				List<Player> playerWithEntryHoldKill = Demo.Players.Where(p => p.HasEntryHoldKill).ToList();
				foreach (Player player in playerWithEntryHoldKill)
				{
					if (player.Side == e.Winner) player.EntryHoldKills.Last().HasWonRound = true;
				}

				ComputeEseaRws();
			});
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

			// sometimes round_end isn't triggered, I update the score here
			if (!IsRoundEndOccured)
			{
				if (Demo.ScoreTeam1 < Parser.CTScore)
				{
					// CT won
					CurrentRound.WinnerName = Demo.TeamCT.Name;
					CurrentRound.WinnerSide = Side.CounterTerrorist;
					Demo.ScoreTeam1++;
					if (IsOvertime)
					{
						CurrentOvertime.ScoreTeam1++;
					}
					else
					{
						Demo.ScoreFirstHalfTeam1++;
					}
				}
				else
				{
					// T won
					CurrentRound.WinnerName = Demo.TeamT.Name;
					CurrentRound.WinnerSide = Side.Terrorist;
					Demo.ScoreTeam2++;
					if (IsOvertime)
					{
						CurrentOvertime.ScoreTeam2++;
					}
					else
					{
						Demo.ScoreFirstHalfTeam2++;
					}
				}
			}

			CheckForSpecialClutchEnd();
			UpdateKillsCount();
			UpdatePlayerScore();
			CurrentRound.EndTimeSeconds = Parser.CurrentTime;

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

			if (IsSwapTeamRequired)
			{
				SwapTeams();
				IsSwapTeamRequired = false;
			}
		}

		protected void HandleFreezetimeEnded(object sender, FreezetimeEndedEventArgs e)
		{
			if (!IsMatchStarted) return;

			IsFreezetime = false;
		}

		protected void HandleBombPlanted(object sender, BombEventArgs e)
		{
			if (!IsMatchStarted || e.Player == null) return;

			BombPlantedEvent bombPlantedEvent = new BombPlantedEvent(Parser.IngameTick, Parser.CurrentTime)
			{
				PlanterSteamId = e.Player.SteamID,
				PlanterName = e.Player.Name,
				Site = e.Site.ToString(),
				X = e.Player.Position.X,
				Y = e.Player.Position.Y
			};

			if (e.Player.SteamID != 0)
			{
				Player player = Demo.Players.FirstOrDefault(p => p.SteamId == e.Player.SteamID);
				if (player != null) player.BombPlantedCount++;
			}

			Demo.BombPlanted.Add(bombPlantedEvent);
			CurrentRound.BombPlanted = bombPlantedEvent;

			if (AnalyzePlayersPosition && e.Player.SteamID != 0)
			{
				PositionPoint positionPoint = new PositionPoint
				{
					X = e.Player.Position.X,
					Y = e.Player.Position.Y,
					PlayerSteamId = e.Player.SteamID,
					PlayerName = e.Player.Name,
					Team = e.Player.Team,
					Event = bombPlantedEvent,
					RoundNumber = CurrentRound.Number
				};
				Demo.PositionPoints.Add(positionPoint);
			}
		}

		protected void HandleBombDefused(object sender, BombEventArgs e)
		{
			if (!IsMatchStarted || e.Player == null) return;

			BombDefusedEvent bombDefusedEvent = new BombDefusedEvent(Parser.IngameTick, Parser.CurrentTime)
			{
				DefuserSteamId = e.Player.SteamID,
				DefuserName = e.Player.Name,
				Site = e.Site.ToString()
			};

			if (e.Player.SteamID != 0)
			{
				Player player = Demo.Players.FirstOrDefault(p => p.SteamId == e.Player.SteamID);
				if (player != null) player.BombDefusedCount++;
			}
			Demo.BombDefused.Add(bombDefusedEvent);
			CurrentRound.BombDefused = bombDefusedEvent;

			if (AnalyzePlayersPosition && bombDefusedEvent.DefuserSteamId != 0)
			{
				PositionPoint positionPoint = new PositionPoint
				{
					X = e.Player.Position.X,
					Y = e.Player.Position.Y,
					PlayerSteamId = e.Player.SteamID,
					PlayerName = e.Player.Name,
					Team = e.Player.Team,
					Event = bombDefusedEvent,
					RoundNumber = CurrentRound.Number
				};
				Demo.PositionPoints.Add(positionPoint);
			}
		}

		protected void HandleBombExploded(object sender, BombEventArgs e)
		{
			if (!IsMatchStarted || e.Player == null) return;

			BombExplodedEvent bombExplodedEvent = new BombExplodedEvent(Parser.IngameTick, Parser.CurrentTime)
			{
				Site = e.Site.ToString(),
				PlanterSteamId = e.Player.SteamID,
				PlanterName = e.Player.Name
			};

			Player planter = Demo.Players.FirstOrDefault(p => p.SteamId == e.Player.SteamID);
			if (planter != null) planter.BombExplodedCount++;

			Demo.BombExploded.Add(bombExplodedEvent);
			CurrentRound.BombExploded = bombExplodedEvent;

			if (AnalyzePlayersPosition && planter != null)
			{
				PositionPoint positionPoint = new PositionPoint
				{
					X = Demo.BombPlanted.Last().X,
					Y = Demo.BombPlanted.Last().Y,
					PlayerSteamId = e.Player.SteamID,
					PlayerName = e.Player.Name,
					Team = e.Player.Team,
					Event = bombExplodedEvent,
					RoundNumber = CurrentRound.Number
				};
				Demo.PositionPoints.Add(positionPoint);
			}
		}

		protected void HandleWeaponFired(object sender, WeaponFiredEventArgs e)
		{
			if (!IsMatchStarted || e.Shooter == null) return;

			if (!IsFirstShotOccured)
			{
				IsFirstShotOccured = true;
				// update the equipement value for each player
				foreach (DemoInfo.Player pl in Parser.PlayingParticipants)
				{
					Player player = Demo.Players.FirstOrDefault(p => p.SteamId == pl.SteamID);
					if (player != null) player.EquipementValueRounds[CurrentRound.Number] = pl.CurrentEquipmentValue;
				}

				if (IsHalfMatch)
				{
					CurrentRound.EquipementValueTeam1 = Parser.Participants.Where(a => a.Team == Side.Terrorist).Sum(a => a.CurrentEquipmentValue);
					CurrentRound.EquipementValueTeam2 = Parser.Participants.Where(a => a.Team == Side.CounterTerrorist).Sum(a => a.CurrentEquipmentValue);
				}
				else
				{
					CurrentRound.EquipementValueTeam1 = Parser.Participants.Where(a => a.Team == Side.CounterTerrorist).Sum(a => a.CurrentEquipmentValue);
					CurrentRound.EquipementValueTeam2 = Parser.Participants.Where(a => a.Team == Side.Terrorist).Sum(a => a.CurrentEquipmentValue);
				}

				// Not 100% accurate maybe improved it with current equipement...
				if (CurrentRound.StartMoneyTeam1 == 4000 && CurrentRound.StartMoneyTeam2 == 4000)
				{
					CurrentRound.Type = RoundType.PISTOL_ROUND;
				}
				else
				{
					double diffPercent = Math.Abs(Math.Round((((double)CurrentRound.EquipementValueTeam1 - CurrentRound.EquipementValueTeam2) / (((double)CurrentRound.EquipementValueTeam1 + CurrentRound.EquipementValueTeam2) / 2) * 100), 2));
					if (diffPercent >= 90)
					{
						CurrentRound.Type = RoundType.ECO;
					}
					else if (diffPercent >= 75 && diffPercent < 90)
					{
						CurrentRound.Type = RoundType.SEMI_ECO;
					}
					else if (diffPercent >= 50 && diffPercent < 75)
					{
						CurrentRound.Type = RoundType.FORCE_BUY;
					}
					else
					{
						CurrentRound.Type = RoundType.NORMAL;
					}

					if (CurrentRound.Type != RoundType.NORMAL)
					{
						if (IsOvertime)
						{
							if (IsHalfMatch)
							{
								if (CurrentRound.EquipementValueTeam1 > CurrentRound.EquipementValueTeam2)
								{
									CurrentRound.TeamTroubleName = Demo.TeamCT.Name;
									CurrentRound.SideTrouble = Side.CounterTerrorist;
								}
								else
								{
									CurrentRound.TeamTroubleName = Demo.TeamT.Name;
									CurrentRound.SideTrouble = Side.Terrorist;
								}
							}
							else
							{
								if (CurrentRound.EquipementValueTeam1 > CurrentRound.EquipementValueTeam2)
								{
									CurrentRound.TeamTroubleName = Demo.TeamT.Name;
									CurrentRound.SideTrouble = Side.CounterTerrorist;
								}
								else
								{
									CurrentRound.TeamTroubleName = Demo.TeamCT.Name;
									CurrentRound.SideTrouble = Side.Terrorist;
								}
							}
						}
						else
						{
							if (IsHalfMatch)
							{
								if (CurrentRound.EquipementValueTeam1 > CurrentRound.EquipementValueTeam2)
								{
									CurrentRound.TeamTroubleName = Demo.TeamCT.Name;
									CurrentRound.SideTrouble = Side.Terrorist;
								}
								else
								{
									CurrentRound.TeamTroubleName = Demo.TeamT.Name;
									CurrentRound.SideTrouble = Side.CounterTerrorist;
								}
							}
							else
							{
								if (CurrentRound.EquipementValueTeam1 > CurrentRound.EquipementValueTeam2)
								{
									CurrentRound.TeamTroubleName = Demo.TeamT.Name;
									CurrentRound.SideTrouble = Side.Terrorist;
								}
								else
								{
									CurrentRound.TeamTroubleName = Demo.TeamCT.Name;
									CurrentRound.SideTrouble = Side.CounterTerrorist;
								}
							}
						}
					}
						
				}
			}

			Player shooter = Demo.Players.FirstOrDefault(p => p.SteamId == e.Shooter.SteamID);
			Weapon weapon = Weapon.WeaponList.FirstOrDefault(w => w.Element == e.Weapon.Weapon);
			if (shooter == null || weapon == null) return;

			WeaponFireEvent shoot = new WeaponFireEvent(Parser.IngameTick, Parser.CurrentTime)
			{
				ShooterSteamId = shooter.SteamId,
				ShooterName = shooter.Name,
				Weapon = weapon,
				RoundNumber = CurrentRound.Number,
				ShooterVelocityX = e.Shooter.Velocity.X,
				ShooterVelocityY = e.Shooter.Velocity.Y,
				ShooterVelocityZ = e.Shooter.Velocity.Z,
				ShooterSide = e.Shooter.Team,
				Point = new HeatmapPoint
				{
					X = e.Shooter.Position.X,
					Y = e.Shooter.Position.Y
				},
				ShooterPosX = e.Shooter.Position.X,
				ShooterPosY = e.Shooter.Position.Y,
				ShooterPosZ = e.Shooter.Position.Z,
				ShooterAnglePitch = e.Shooter.ViewDirectionY,
				ShooterAngleYaw = e.Shooter.ViewDirectionX
			};

			if (e.Weapon.Class == EquipmentClass.Grenade)
			{
				CurrentRound.WeaponFired.Add(shoot);
			}

			switch (e.Weapon.Weapon)
			{
				case EquipmentElement.Incendiary:
					shooter.IncendiaryThrownCount++;
					break;
				case EquipmentElement.Molotov:
					shooter.MolotovThrownCount++;
					break;
				case EquipmentElement.Decoy:
					shooter.DecoyThrownCount++;
					break;
				case EquipmentElement.Flash:
					shooter.FlashbangThrownCount++;
					PlayersFlashQueue.Enqueue(shooter);
					break;
				case EquipmentElement.HE:
					shooter.HeGrenadeThrownCount++;
					break;
				case EquipmentElement.Smoke:
					shooter.SmokeThrownCount++;
					break;
			}

			Demo.WeaponFired.Add(shoot);

			if (e.Shooter.SteamID == 0) return;

			switch (e.Weapon.Weapon)
			{
				case EquipmentElement.Incendiary:
				case EquipmentElement.Molotov:
					LastPlayersThrownMolotov.Enqueue(Demo.Players.First(p => p.SteamId == e.Shooter.SteamID));
					if (!AnalyzePlayersPosition) return;
					goto case EquipmentElement.Decoy;
				case EquipmentElement.Decoy:
				case EquipmentElement.Flash:
				case EquipmentElement.HE:
				case EquipmentElement.Smoke:
					PositionPoint positionPoint = new PositionPoint
					{
						X = e.Shooter.Position.X,
						Y = e.Shooter.Position.Y,
						PlayerSteamId = e.Shooter.SteamID,
						PlayerName = e.Shooter.Name,
						Team = e.Shooter.Team,
						Event = shoot,
						RoundNumber = CurrentRound.Number
					};
					Demo.PositionPoints.Add(positionPoint);
					break;
			}
		}

		protected void HandleFireNadeStarted(object sender, FireEventArgs e)
		{
			if (!IsMatchStarted) return;

			switch (e.NadeType)
			{
				case EquipmentElement.Incendiary:
				case EquipmentElement.Molotov:
					MolotovFireStartedEvent molotovEvent = new MolotovFireStartedEvent(Parser.IngameTick, Parser.CurrentTime)
					{
						Point = new HeatmapPoint
						{
							X = e.Position.X,
							Y = e.Position.Y
						},
						RoundNumber = CurrentRound.Number
					};
					Player thrower = null;
					
					if (e.ThrownBy != null)
					{
						thrower = Demo.Players.First(p => p.SteamId == e.ThrownBy.SteamID);
						molotovEvent.ThrowerSide = e.ThrownBy.Team;
					}

					if (LastPlayersThrownMolotov.Any())
					{
						LastPlayersFireStartedMolotov.Enqueue(LastPlayersThrownMolotov.Peek());
						// Remove the last player who thrown a molo
						thrower = LastPlayersThrownMolotov.Dequeue();
					}

					if (thrower != null)
					{
						molotovEvent.ThrowerSteamId = thrower.SteamId;
						molotovEvent.ThrowerName = thrower.Name;

						if (AnalyzePlayersPosition)
						{
							PositionPoint positionPoint = new PositionPoint
							{
								X = e.Position.X,
								Y = e.Position.Y,
								PlayerSteamId = thrower.SteamId,
								PlayerName = thrower.Name,
								Team = thrower.Side,
								Event = molotovEvent,
								RoundNumber = CurrentRound.Number
							};
							Demo.PositionPoints.Add(positionPoint);
						}
					}
					Demo.MolotovsFireStarted.Add(molotovEvent);
					break;
			}
		}

		protected void HandleFireNadeEnded(object sender, FireEventArgs e)
		{
			if (!AnalyzePlayersPosition || !IsMatchStarted) return;

			switch (e.NadeType)
			{
				case EquipmentElement.Incendiary:
				case EquipmentElement.Molotov:
					MolotovFireEndedEvent molotovEvent = new MolotovFireEndedEvent(Parser.IngameTick, Parser.CurrentTime)
					{
						Point = new HeatmapPoint
						{
							X = e.Position.X,
							Y = e.Position.Y
						}
					};

					Player thrower = null;

					// Thrower is not indicated every time
					if (e.ThrownBy != null)
					{
						thrower = Demo.Players.FirstOrDefault(player => player.SteamId == e.ThrownBy.SteamID);
					}

					if (LastPlayersFireStartedMolotov.Any())
					{
						LastPlayersFireEndedMolotov.Enqueue(LastPlayersFireStartedMolotov.Peek());
						// Remove the last player who started a fire
						thrower = LastPlayersFireStartedMolotov.Dequeue();
					}

					if (thrower != null)
					{
						molotovEvent.ThrowerSteamId = thrower.SteamId;
						molotovEvent.ThrowerName = thrower.Name;

						PositionPoint positionPoint = new PositionPoint
						{
							X = e.Position.X,
							Y = e.Position.Y,
							PlayerSteamId = thrower.SteamId,
							PlayerName = thrower.Name,
							Team = thrower.Side,
							Event = molotovEvent,
							RoundNumber = CurrentRound.Number
						};
						Demo.PositionPoints.Add(positionPoint);
					}
					
					break;
			}
		}

		protected void HandleExplosiveNadeExploded(object sender, GrenadeEventArgs e)
		{
			if (!IsMatchStarted || e.ThrownBy == null) return;
			Player thrower = Demo.Players.FirstOrDefault(player => player.SteamId == e.ThrownBy.SteamID);
			ExplosiveNadeExplodedEvent explosiveEvent = new ExplosiveNadeExplodedEvent(Parser.IngameTick, Parser.CurrentTime)
			{
				ThrowerSteamId = thrower?.SteamId ?? 0,
				ThrowerName = thrower == null ? string.Empty : thrower.Name,
				ThrowerSide = e.ThrownBy.Team,
				Point = new HeatmapPoint
				{
					X = e.Position.X,
					Y = e.Position.Y
				}
			};

			CurrentRound.ExplosiveGrenadesExploded.Add(explosiveEvent);

			if (AnalyzePlayersPosition && thrower != null)
			{
				PositionPoint positionPoint = new PositionPoint
				{
					X = e.Position.X,
					Y = e.Position.Y,
					PlayerSteamId = e.ThrownBy.SteamID,
					PlayerName = e.ThrownBy.Name,
					Team = e.ThrownBy.Team,
					Event = explosiveEvent,
					RoundNumber = CurrentRound.Number
				};
				Demo.PositionPoints.Add(positionPoint);
			}
		}

		protected void HandleFlashNadeExploded(object sender, FlashEventArgs e)
		{
			if(!IsMatchStarted || e.ThrownBy == null || !PlayersFlashQueue.Any()) return;

			if (PlayersFlashQueue.Any())
			{
				LastPlayerExplodedFlashbang = PlayersFlashQueue.Dequeue();
				// update flash intensity value for each player when the flash poped
				foreach (DemoInfo.Player player in Parser.PlayingParticipants)
				{
					Player pl = Demo.Players.FirstOrDefault(p => p.SteamId == player.SteamID);
					if (pl != null) pl.FlashDurationTemp = player.FlashDuration;
				}
				// set it to true to start analyzing flashbang status at each tick
				AnalyzeFlashbang = true;
			}

			Player thrower = Demo.Players.FirstOrDefault(player => player.SteamId == e.ThrownBy.SteamID);
			FlashbangExplodedEvent flashbangEvent = new FlashbangExplodedEvent(Parser.IngameTick, Parser.CurrentTime)
			{
				ThrowerSteamId = thrower?.SteamId ?? 0,
				ThrowerName = thrower == null ? string.Empty : thrower.Name,
				ThrowerSide = e.ThrownBy.Team,
				Point = new HeatmapPoint
				{
					X = e.Position.X,
					Y = e.Position.Y
				}
			};

			if (e.FlashedPlayers != null)
			{
				foreach (DemoInfo.Player pl in e.FlashedPlayers)
				{
					Player player = Demo.Players.FirstOrDefault(p => p.SteamId == pl.SteamID);
					if (player != null)
					{
						flashbangEvent.FlashedPlayerSteamIdList.Add(player.SteamId);
					}
				}
			}

			CurrentRound.FlashbangsExploded.Add(flashbangEvent);

			if (AnalyzePlayersPosition && thrower != null)
			{
				PositionPoint positionPoint = new PositionPoint
				{
					X = e.Position.X,
					Y = e.Position.Y,
					PlayerSteamId = e.ThrownBy.SteamID,
					PlayerName = e.ThrownBy.Name,
					Team = e.ThrownBy.Team,
					RoundNumber = CurrentRound.Number,
					Event = flashbangEvent
				};
				Demo.PositionPoints.Add(positionPoint);
			}
		}

		protected void HandleSmokeNadeStarted(object sender, SmokeEventArgs e)
		{
			if (!IsMatchStarted || e.ThrownBy == null) return;

			Player thrower = Demo.Players.FirstOrDefault(player => player.SteamId == e.ThrownBy.SteamID);

			SmokeNadeStartedEvent smokeEvent = new SmokeNadeStartedEvent(Parser.IngameTick, Parser.CurrentTime)
			{
				ThrowerSteamId = thrower?.SteamId ?? 0,
				ThrowerName = thrower == null ? string.Empty : thrower.Name,
				ThrowerSide = e.ThrownBy.Team,
				Point = new HeatmapPoint
				{
					X = e.Position.X,
					Y = e.Position.Y
				}
			};

			CurrentRound.SmokeStarted.Add(smokeEvent);

			if (AnalyzePlayersPosition && thrower != null)
			{
				PositionPoint positionPoint = new PositionPoint
				{
					X = e.Position.X,
					Y = e.Position.Y,
					PlayerSteamId = e.ThrownBy.SteamID,
					PlayerName = e.ThrownBy.Name,
					Team = e.ThrownBy.Team,
					Event = smokeEvent,
					RoundNumber = CurrentRound.Number
				};
				Demo.PositionPoints.Add(positionPoint);
			}
		}

		protected void HandleSmokeNadeEnded(object sender, SmokeEventArgs e)
		{
			if (!AnalyzePlayersPosition || !IsMatchStarted || e.ThrownBy == null) return;

			Player thrower = Demo.Players.FirstOrDefault(player => player.SteamId == e.ThrownBy.SteamID);

			SmokeNadeEndedEvent smokeEvent = new SmokeNadeEndedEvent(Parser.IngameTick, Parser.CurrentTime)
			{
				ThrowerSteamId = thrower?.SteamId ?? 0,
				ThrowerName = thrower == null ? string.Empty : thrower.Name
			};

			if (thrower != null)
			{
				PositionPoint positionPoint = new PositionPoint
				{
					X = e.Position.X,
					Y = e.Position.Y,
					PlayerName = e.ThrownBy.Name,
					PlayerSteamId = e.ThrownBy.SteamID,
					Team = e.ThrownBy.Team,
					Event = smokeEvent,
					RoundNumber = CurrentRound.Number
				};
				Demo.PositionPoints.Add(positionPoint);
			}
		}

		protected void HandleDecoyNadeStarted(object sender, DecoyEventArgs e)
		{
			if (!IsMatchStarted || e.ThrownBy == null) return;

			Player thrower = Demo.Players.FirstOrDefault(player => player.SteamId == e.ThrownBy.SteamID);
			DecoyStartedEvent decoyStartedEvent = new DecoyStartedEvent(Parser.IngameTick, Parser.CurrentTime)
			{
				ThrowerSteamId = thrower?.SteamId ?? 0,
				ThrowerName = thrower == null ? string.Empty : thrower.Name,
				RoundNumber = CurrentRound.Number,
				ThrowerSide = e.ThrownBy.Team,
				Point = new HeatmapPoint
				{
					X = e.Position.X,
					Y = e.Position.Y
				}
			};
			Demo.DecoyStarted.Add(decoyStartedEvent);

			if (AnalyzePlayersPosition && thrower != null)
			{
				PositionPoint positionPoint = new PositionPoint
				{
					X = e.Position.X,
					Y = e.Position.Y,
					PlayerSteamId = e.ThrownBy.SteamID,
					PlayerName = e.ThrownBy.Name,
					Team = e.ThrownBy.Team,
					Event = decoyStartedEvent,
					RoundNumber = CurrentRound.Number
				};
				Demo.PositionPoints.Add(positionPoint);
			}
		}

		protected void HandleDecoyNadeEnded(object sender, DecoyEventArgs e)
		{
			if (!AnalyzePlayersPosition || !IsMatchStarted || e.ThrownBy == null) return;

			Player thrower = Demo.Players.FirstOrDefault(player => player.SteamId == e.ThrownBy.SteamID);
			DecoyEndedEvent decoyEndedEvent = new DecoyEndedEvent(Parser.IngameTick, Parser.CurrentTime)
			{
				ThrowerSteamId = thrower?.SteamId ?? 0,
				ThrowerName = thrower == null ? string.Empty : thrower.Name
			};

			if (thrower != null)
			{
				PositionPoint positionPoint = new PositionPoint
				{
					X = e.Position.X,
					Y = e.Position.Y,
					PlayerSteamId = e.ThrownBy.SteamID,
					PlayerName = e.ThrownBy.Name,
					Team = e.ThrownBy.Team,
					Event = decoyEndedEvent,
					RoundNumber = CurrentRound.Number
				};
				Demo.PositionPoints.Add(positionPoint);
			}
		}

		protected void HandleRoundMvp(object sender, RoundMVPEventArgs e)
		{
			if (!IsMatchStarted) return;

			if (e.Player.SteamID == 0) return;
			Player playerMvp = Demo.Players.FirstOrDefault(player => player.SteamId == e.Player.SteamID);
			if (playerMvp != null) playerMvp.RoundMvpCount++;
		}

		/// <summary>
		/// When a player is hurted
		/// Trigerred only with demos > 06/30/2015
		/// </summary>
		/// <param name="sender"></param>
		/// <param name="e"></param>
		protected void HandlePlayerHurted(object sender, PlayerHurtEventArgs e)
		{
			if (!IsMatchStarted || e.Player == null || e.Weapon == null) return;

			// may be a bot on MM demos
			Player hurted = Demo.Players.FirstOrDefault(player => player.SteamId == e.Player.SteamID);
			Weapon weapon = Weapon.WeaponList.FirstOrDefault(w => w.Element == e.Weapon.Weapon);
			if (hurted == null || weapon == null) return;
			Player attacker = null;
			// attacker may be null (hurted by world)
			if (e.Attacker != null) attacker = Demo.Players.FirstOrDefault(player => player.SteamId == e.Attacker.SteamID);

			PlayerHurtedEvent playerHurtedEvent = new PlayerHurtedEvent(Parser.IngameTick, Parser.CurrentTime)
			{
				AttackerSteamId = attacker?.SteamId ?? 0,
				AttackerSide = e.Attacker?.Team ?? Side.Spectate,
				HurtedSteamId = hurted.SteamId,
				ArmorDamage = e.ArmorDamage,
				HealthDamage = e.Player.HP < e.HealthDamage ? e.Player.HP : e.HealthDamage,
				HitGroup = e.Hitgroup,
				Weapon = weapon,
				RoundNumber = CurrentRound.Number
			};

			Demo.PlayersHurted.Add(playerHurtedEvent);
			attacker?.PlayersHurted.Add(playerHurtedEvent);
			hurted.PlayersHurted.Add(playerHurtedEvent);
			CurrentRound.PlayersHurted.Add(playerHurtedEvent);
		}

		/// <summary>
		/// Handler for when a player disconnect from the server
		/// Used to avoid wrong clutch count as the player may be considered as alive and in a specific team whereas he is not
		/// </summary>
		/// <param name="sender"></param>
		/// <param name="e"></param>
		protected void HandlePlayerDisconnect(object sender, PlayerDisconnectEventArgs e)
		{
			if (e.Player == null) return;
			Player playerDisconnected = Demo.Players.FirstOrDefault(p => p.SteamId == e.Player.SteamID);
			if (playerDisconnected == null) return;
			playerDisconnected.IsAlive = false;
			playerDisconnected.Side = Side.Spectate;
			playerDisconnected.IsConnected = false;
		}

		protected void HandlePlayerTeam(object sender, PlayerTeamEventArgs e)
		{
			if (e.Swapped == null || e.Swapped.SteamID == 0) return;
			Player player = Demo.Players.FirstOrDefault(p => p.SteamId == e.Swapped.SteamID);
			if (player == null)
			{
				Player newPlayer = new Player
				{
					SteamId = e.Swapped.SteamID,
					Name = e.Swapped.Name,
					Side = e.NewTeam
				};
				Application.Current.Dispatcher.Invoke(() => Demo.Players.Add(newPlayer));
				if (e.NewTeam == Side.CounterTerrorist)
				{
					Application.Current.Dispatcher.Invoke(() => Demo.TeamCT.Players.Add(newPlayer));
					newPlayer.TeamName = Demo.TeamCT.Name;
				}
				else
				{
					Application.Current.Dispatcher.Invoke(() => Demo.TeamT.Players.Add(newPlayer));
					newPlayer.TeamName = Demo.TeamT.Name;
				}
				return;
			}
			player.IsConnected = true;
			player.Side = e.NewTeam;
		}

		#endregion

		#region Process

		/// <summary>
		/// Update kills count for each player, current round and demo
		/// </summary>
		protected void UpdateKillsCount()
		{
			foreach (KeyValuePair<DemoInfo.Player, int> pair in KillsThisRound)
			{
				// Keep individual kills for each players
				Player player = Demo.Players.FirstOrDefault(p => p.SteamId == pair.Key.SteamID);
				if (player == null) continue;
				switch (pair.Value)
				{
					case 1:
						player.OneKillCount++;
						Demo.OneKillCount++;
						CurrentRound.OneKillCount++;
						break;
					case 2:
						player.TwoKillCount++;
						Demo.TwoKillCount++;
						CurrentRound.TwoKillCount++;
						break;
					case 3:
						player.ThreeKillCount++;
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
			IsRoundEndOccured = false;
			CurrentRound = new Round
			{
				Tick = Parser.IngameTick,
				Number = ++RoundCount,
				StartTimeSeconds = Parser.CurrentTime
			};
			CurrentClutch = null;

			KillsThisRound.Clear();
			// Sometimes parser return wrong money values on 1st round of side
			if (CurrentRound.Number == 1 || CurrentRound.Number == 16)
			{
				CurrentRound.StartMoneyTeam1 = 4000;
				CurrentRound.StartMoneyTeam2 = 4000;
			}
			else
			{
				CurrentRound.StartMoneyTeam1 = Parser.Participants.Where(a => a.Team == Side.CounterTerrorist).Sum(a => a.Money);
				CurrentRound.StartMoneyTeam2 = Parser.Participants.Where(a => a.Team == Side.Terrorist).Sum(a => a.Money);
			}

			IsFirstKillOccured = false;
			IsFirstShotOccured = false;
			_playerInClutch1 = null;
			_playerInClutch2 = null;

			// Nobody is controlling a BOT at the beginning of a round
			foreach (Player pl in Demo.Players)
			{
				pl.HasEntryKill = false;
				pl.HasEntryHoldKill = false;
				pl.IsControllingBot = false;
				if (pl.IsConnected) pl.RoundPlayedCount++;
				if (!pl.RoundsMoneyEarned.ContainsKey(CurrentRound.Number)) pl.RoundsMoneyEarned.Add(CurrentRound.Number, 0);
				if (!pl.StartMoneyRounds.ContainsKey(CurrentRound.Number)) pl.StartMoneyRounds.Add(CurrentRound.Number, 0);
				if (!pl.EquipementValueRounds.ContainsKey(CurrentRound.Number)) pl.EquipementValueRounds.Add(CurrentRound.Number, 0);
				DemoInfo.Player player = Parser.PlayingParticipants.FirstOrDefault(p => p.SteamID == pl.SteamId);
				if (player != null)
				{
					pl.Side = player.Team;
					pl.StartMoneyRounds[CurrentRound.Number] = player.Money;
					pl.IsAlive = true;
				}
				else
				{
					pl.IsAlive = false;
				}
			}
		}

		/// <summary>
		/// Update the players score (displayed on the scoreboard)
		/// </summary>
		protected void UpdatePlayerScore()
		{
			// Update players score
			foreach (DemoInfo.Player player in Parser.PlayingParticipants)
			{
				Player pl = Demo.Players.FirstOrDefault(p => p.SteamId == player.SteamID);
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
			foreach (Player pl in Demo.Players)
			{
				pl.Side = pl.Side == Side.Terrorist ? Side.CounterTerrorist : Side.Terrorist;
			}
		}

		/// <summary>
		/// Check if there is any clutch situation and if so add clutch to player
		/// </summary>
		protected void ProcessClutches()
		{
			int terroristAliveCount = Parser.PlayingParticipants.Count(p => p.Team == Side.Terrorist && p.IsAlive);
			int counterTerroristAliveCount = Parser.PlayingParticipants.Count(p => p.Team == Side.CounterTerrorist && p.IsAlive);

			// First dectection of a 1vX situation, a terro is in clutch
			if (_playerInClutch1 == null && terroristAliveCount == 1)
			{
				// Set the number of opponent in his clutch
				DemoInfo.Player pl = Parser.PlayingParticipants.FirstOrDefault(p => p.Team == Side.Terrorist && p.IsAlive);
				if (pl == null) return;
				_playerInClutch1 = Demo.Players.FirstOrDefault(p => p.SteamId == pl.SteamID && p.IsAlive);
				if (_playerInClutch1 != null)
				{
					_playerInClutch1.Clutches.Add(new ClutchEvent(Parser.IngameTick, Parser.CurrentTime)
					{
						RoundNumber = CurrentRound.Number,
						OpponentCount = counterTerroristAliveCount
					});
					return;
				}
			}

			// First dectection of a 1vX situation, a CT is in clutch
			if (_playerInClutch1 == null && counterTerroristAliveCount == 1)
			{
				DemoInfo.Player pl = Parser.PlayingParticipants.FirstOrDefault(p => p.Team == Side.CounterTerrorist && p.IsAlive);
				if (pl == null) return;
				_playerInClutch1 = Demo.Players.FirstOrDefault(p => p.SteamId == pl.SteamID && p.IsAlive);
				if (_playerInClutch1 != null)
				{
					_playerInClutch1.Clutches.Add(new ClutchEvent(Parser.IngameTick, Parser.CurrentTime)
					{
						RoundNumber = CurrentRound.Number,
						OpponentCount = terroristAliveCount
					});
					return;
				}
			}

			// 1v1 detection
			if (counterTerroristAliveCount == 1 && terroristAliveCount == 1 && _playerInClutch1 != null)
			{
				DemoInfo.Player player1 = Parser.PlayingParticipants.FirstOrDefault(p => p.SteamID == _playerInClutch1.SteamId);
				if (player1 == null) return;
				Side player2Team = player1.Team == Side.CounterTerrorist ? Side.Terrorist : Side.CounterTerrorist;
				DemoInfo.Player player2 = Parser.PlayingParticipants.FirstOrDefault(p => p.Team == player2Team);
				if (player2 == null) return;
				_playerInClutch2 = Demo.Players.FirstOrDefault(p => p.SteamId == player2.SteamID && p.IsAlive);
				if (_playerInClutch2 == null) return;
				_playerInClutch2.Clutches.Add(new ClutchEvent(Parser.IngameTick, Parser.CurrentTime)
				{
					RoundNumber = CurrentRound.Number,
					OpponentCount = 1
				});
			}
		}

		/// <summary>
		/// Calculate HLTV rating for each players
		/// </summary>
		protected void ProcessPlayersRating()
		{
			foreach (Player player in Demo.Players)
			{
				player.RatingHltv = (float)ComputeHltvOrgRating(Demo.Rounds.Count, player.KillCount, player.DeathCount, new int[5]
				{
					player.OneKillCount, player.TwoKillCount, player.ThreeKillCount, player.FourKillCount, player.FiveKillCount
				});
			}
		}

		/// <summary>
		/// Compute HLTV.org's player rating from player data
		/// </summary>
		/// <param name="roundCount">total number of rounds for the game</param>
		/// <param name="kills">number of kills of a player during the whole game</param>
		/// <param name="deaths">number of deaths of a player during the whole game</param>
		/// <param name="nKills">an array of int containing the total number of x kills in a round during a game for a player. nKills[0] = number of 1 kill, nKills[1] = number of 2 kills, ...</param>
		/// <returns></returns>
		private static double ComputeHltvOrgRating(int roundCount, int kills, int deaths, int[] nKills)
		{
			// Kills/Rounds/AverageKPR
			double killRating = kills / (double)roundCount / AVERAGE_KPR;
			// (Rounds-Deaths)/Rounds/AverageSPR
			double survivalRating = (roundCount - deaths) / (double)roundCount / AVERAGE_SPR;
			// (1K + 4*2K + 9*3K + 16*4K + 25*5K)/Rounds/AverageRMK
			double roundsWithMultipleKillsRating = (nKills[0] + 4 * nKills[1] + 9 * nKills[2] + 16 * nKills[3] + 25 * nKills[4]) / (double)roundCount / AVERAGE_RMK;

			return Math.Round((killRating + 0.7 * survivalRating + roundsWithMultipleKillsRating) / 2.7, 3);
		}

		protected void ComputeEseaRws()
		{
			int totalDamageWinner = 0;
			Dictionary<long, int> playerDamages = new Dictionary<long, int>();
			foreach (PlayerHurtedEvent e in CurrentRound.PlayersHurted.Where(
				e => e.AttackerSide == CurrentRound.WinnerSide))
			{
				if (!playerDamages.ContainsKey(e.AttackerSteamId))
				{
					playerDamages.Add(e.AttackerSteamId, e.HealthDamage);
				}
				else
				{
					playerDamages[e.AttackerSteamId] += e.HealthDamage;
				}
					
				totalDamageWinner += e.HealthDamage;
			}

			foreach (Player player in Demo.Players)
			{
				if (player.TeamName == CurrentRound.WinnerName && player.IsConnected)
				{
					switch (CurrentRound.EndReason)
					{
						case RoundEndReason.CTWin:
						case RoundEndReason.TerroristWin:
							if (totalDamageWinner > 0 && playerDamages.ContainsKey(player.SteamId))
								player.EseaRwsPointCount += (decimal)playerDamages[player.SteamId] / totalDamageWinner * 100;
							break;
						case RoundEndReason.BombDefused:
						case RoundEndReason.TargetBombed:
							if (CurrentRound.BombDefused != null && CurrentRound.BombDefused.DefuserSteamId == player.SteamId)
								player.EseaRwsPointCount += 30;
							if (CurrentRound.BombPlanted != null && CurrentRound.BombPlanted.PlanterSteamId == player.SteamId)
								player.EseaRwsPointCount += 30;
							if (totalDamageWinner > 0 && playerDamages.ContainsKey(player.SteamId))
								player.EseaRwsPointCount += (decimal)playerDamages[player.SteamId] / totalDamageWinner * 70;
							break;
					}
				}
				if (player.RoundPlayedCount > 0)
					player.EseaRws = Math.Round(player.EseaRwsPointCount / player.RoundPlayedCount, 2);
			}
		}

		protected void ProcessTradeKill(KillEvent killEvent)
		{
			KillEvent lastKilledEvent = CurrentRound.Kills.LastOrDefault(k => k.KillerSteamId == killEvent.KilledSteamId);
			if (lastKilledEvent != null && Parser.CurrentTime - lastKilledEvent.Seconds <= 4)
			{
				killEvent.IsTradeKill = true;
				Player killer = Demo.Players.FirstOrDefault(p => p.SteamId == killEvent.KillerSteamId);
				if (killer != null) killer.TradeKillCount++;
				Player killed = Demo.Players.FirstOrDefault(p => p.SteamId == killEvent.KilledSteamId);
				if (killed != null) killed.TradeDeathCount++;
			}
		}

		protected void ProcessOpenAndEntryKills(KillEvent killEvent)
		{
			if (killEvent.KillerSteamId == 0 || IsFirstKillOccured) return;

			Player killed = Demo.Players.FirstOrDefault(p => Equals(p.SteamId, killEvent.KilledSteamId));
			if (killed == null) return;
			Player killer = Demo.Players.FirstOrDefault(p => Equals(p.SteamId, killEvent.KillerSteamId));
			if (killer == null) return;

			if (killEvent.KillerSide == Side.Terrorist)
			{
				// This is an entry kill
				Application.Current.Dispatcher.Invoke(delegate
				{
					killer.HasEntryKill = true;
					killed.HasEntryKill = true;
					EntryKillEvent entryKillEvent = new EntryKillEvent(Parser.IngameTick, Parser.CurrentTime)
					{
						RoundNumber = CurrentRound.Number,
						KilledSteamId = killed.SteamId,
						KilledName = killed.Name,
						KilledSide = killEvent.KilledSide,
						KillerSteamId = killer.SteamId,
						KillerName = killer.Name,
						KillerSide = killEvent.KillerSide,
						Weapon = killEvent.Weapon
					};
					CurrentRound.EntryKillEvent = entryKillEvent;
					EntryKillEvent killerEvent = CurrentRound.EntryKillEvent.Clone();
					killerEvent.HasWon = true;
					killer.EntryKills.Add(killerEvent);
					EntryKillEvent killedEvent = CurrentRound.EntryKillEvent.Clone();
					killedEvent.HasWon = false;
					killed.EntryKills.Add(killedEvent);
				});
			}
			else
			{
				// CT done the kill , it's an entry hold kill
				killer.HasEntryHoldKill = true;
				killed.HasEntryHoldKill = true;
				EntryHoldKillEvent entryHoldKillEvent = new EntryHoldKillEvent(Parser.IngameTick, Parser.CurrentTime)
				{
					RoundNumber = CurrentRound.Number,
					KilledSteamId = killed.SteamId,
					KilledName = killed.Name,
					KilledSide = killEvent.KilledSide,
					KillerSteamId = killer.SteamId,
					KillerName = killer.Name,
					KillerSide = killEvent.KillerSide,
					Weapon = killEvent.Weapon
				};
				CurrentRound.EntryHoldKillEvent = entryHoldKillEvent;
				EntryHoldKillEvent killerEvent = CurrentRound.EntryHoldKillEvent.Clone();
				killerEvent.HasWon = true;
				killer.EntryHoldKills.Add(killerEvent);
				EntryHoldKillEvent killedEvent = CurrentRound.EntryHoldKillEvent.Clone();
				killedEvent.HasWon = false;
				killed.EntryHoldKills.Add(killedEvent);
			}

			IsFirstKillOccured = true;
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
					if (roundEndedEventArgs.Winner == Side.Terrorist)
					{
						CurrentOvertime.ScoreTeam2++;
						Demo.ScoreTeam2++;
						CurrentRound.WinnerName = Demo.TeamT.Name;
						Demo.TeamT.LossRowCount = 0;
						Demo.TeamCT.LossRowCount++;
					}
					else
					{
						CurrentOvertime.ScoreTeam1++;
						Demo.ScoreTeam1++;
						CurrentRound.WinnerName = Demo.TeamCT.Name;
						Demo.TeamCT.LossRowCount = 0;
						Demo.TeamT.LossRowCount++;
					}
				}
				else
				{
					if (roundEndedEventArgs.Winner == Side.CounterTerrorist)
					{
						CurrentOvertime.ScoreTeam2++;
						Demo.ScoreTeam2++;
						CurrentRound.WinnerName = Demo.TeamT.Name;
						Demo.TeamT.LossRowCount = 0;
						Demo.TeamCT.LossRowCount++;
					}
					else
					{
						CurrentOvertime.ScoreTeam1++;
						Demo.ScoreTeam1++;
						CurrentRound.WinnerName = Demo.TeamCT.Name;
						Demo.TeamCT.LossRowCount = 0;
						Demo.TeamT.LossRowCount++;
					}
				}
			}
			else
			{
				if (IsHalfMatch)
				{
					if (roundEndedEventArgs.Winner == Side.Terrorist)
					{
						Demo.ScoreSecondHalfTeam1++;
						Demo.ScoreTeam1++;
						CurrentRound.WinnerName = Demo.TeamCT.Name;
						Demo.TeamCT.LossRowCount = 0;
						Demo.TeamT.LossRowCount++;
					}
					else
					{
						Demo.ScoreSecondHalfTeam2++;
						Demo.ScoreTeam2++;
						CurrentRound.WinnerName = Demo.TeamT.Name;
						Demo.TeamT.LossRowCount = 0;
						Demo.TeamCT.LossRowCount++;
					}
				}
				else
				{
					if (roundEndedEventArgs.Winner == Side.CounterTerrorist)
					{
						Demo.ScoreFirstHalfTeam1++;
						Demo.ScoreTeam1++;
						CurrentRound.WinnerName = Demo.TeamCT.Name;
						Demo.TeamCT.LossRowCount = 0;
						Demo.TeamT.LossRowCount++;
					}
					else
					{
						Demo.ScoreFirstHalfTeam2++;
						Demo.ScoreTeam2++;
						CurrentRound.WinnerName = Demo.TeamT.Name;
						Demo.TeamT.LossRowCount = 0;
						Demo.TeamCT.LossRowCount++;
					}
				}
			}
		}

		/// <summary>
		/// A clutch can be lost / won by bomb exploded / defused
		/// It checks if one of the players currently in a clutch won
		/// </summary>
		protected void CheckForSpecialClutchEnd()
		{
			if (_playerInClutch1 == null) return;

			DemoInfo.Player pl = Parser.PlayingParticipants.FirstOrDefault(p => p.SteamID == _playerInClutch1.SteamId);
			if (pl == null) return;

			// 1vX
			if (_playerInClutch2 == null)
			{
				if (pl.Team == Side.Terrorist && CurrentRound.WinnerSide == Side.Terrorist
					|| pl.Team == Side.CounterTerrorist && CurrentRound.WinnerSide == Side.CounterTerrorist)
				{
					_playerInClutch1.Clutches.Last().HasWon = true;
				}
			} else if (_playerInClutch2 != null)
			{
				// 1V1
				switch (CurrentRound.WinnerSide)
				{
					case Side.CounterTerrorist:
						if (pl.Team == Side.CounterTerrorist)
						{
							// CT won
							_playerInClutch1.Clutches.Last().HasWon = true;
						}
						else
						{
							// T won
							_playerInClutch2.Clutches.Last().HasWon = true;
						}
						break;
					case Side.Terrorist:
						if (pl.Team == Side.Terrorist)
						{
							// T won
							_playerInClutch1.Clutches.Last().HasWon = true;
						}
						else
						{
							// CT won
							_playerInClutch2.Clutches.Last().HasWon = true;
						}
						break;
				}
			}
		}

		protected void ProcessRoundEndReward(RoundEndedEventArgs e)
		{
			Team looser = CurrentRound.WinnerName == Demo.TeamCT.Name ? Demo.TeamT : Demo.TeamCT;
			foreach (Player player in Demo.Players)
			{
				switch (e.Reason)
				{
					case RoundEndReason.BombDefused:
						if (player.Side == Side.CounterTerrorist)
						{
							if (!player.RoundsMoneyEarned.ContainsKey(CurrentRound.Number))
								player.RoundsMoneyEarned[CurrentRound.Number] = WIN_BOMB_DEFUSED;
							else
								player.RoundsMoneyEarned[CurrentRound.Number] += WIN_BOMB_DEFUSED;
						}
						else
						{
							switch (looser.LossRowCount)
							{
								case 1:
									if (!player.RoundsMoneyEarned.ContainsKey(CurrentRound.Number))
										player.RoundsMoneyEarned[CurrentRound.Number] = LOSS_ROW_1 + BOMB_PLANTED_BONUS;
									else
										player.RoundsMoneyEarned[CurrentRound.Number] += LOSS_ROW_1 + BOMB_PLANTED_BONUS;
									break;
								case 2:
									if (!player.RoundsMoneyEarned.ContainsKey(CurrentRound.Number))
										player.RoundsMoneyEarned[CurrentRound.Number] = LOSS_ROW_2 + BOMB_PLANTED_BONUS;
									else
										player.RoundsMoneyEarned[CurrentRound.Number] += LOSS_ROW_2 + BOMB_PLANTED_BONUS;
									break;
								case 3:
									if (!player.RoundsMoneyEarned.ContainsKey(CurrentRound.Number))
										player.RoundsMoneyEarned[CurrentRound.Number] = LOSS_ROW_3 + BOMB_PLANTED_BONUS;
									else
										player.RoundsMoneyEarned[CurrentRound.Number] += LOSS_ROW_3 + BOMB_PLANTED_BONUS;
									break;
								case 4:
									if (!player.RoundsMoneyEarned.ContainsKey(CurrentRound.Number))
										player.RoundsMoneyEarned[CurrentRound.Number] = LOSS_ROW_4 + BOMB_PLANTED_BONUS;
									else
										player.RoundsMoneyEarned[CurrentRound.Number] += LOSS_ROW_4 + BOMB_PLANTED_BONUS;
									break;
								default:
									if (!player.RoundsMoneyEarned.ContainsKey(CurrentRound.Number))
										player.RoundsMoneyEarned[CurrentRound.Number] = LOSS_ROW_5 + BOMB_PLANTED_BONUS;
									else
										player.RoundsMoneyEarned[CurrentRound.Number] += LOSS_ROW_5 + BOMB_PLANTED_BONUS;
									break;
							}
						}
						break;
					case RoundEndReason.TargetBombed:
						if (player.Side == Side.Terrorist)
						{
							if (!player.RoundsMoneyEarned.ContainsKey(CurrentRound.Number))
								player.RoundsMoneyEarned[CurrentRound.Number] = WIN_BOMB_TARGET;
							else
								player.RoundsMoneyEarned[CurrentRound.Number] += WIN_BOMB_TARGET;
						}
						else
							UpdateLooserMoneyReward(looser, player);
						break;
					case RoundEndReason.CTWin:
						if (player.Side == Side.CounterTerrorist)
						{
							if (!player.RoundsMoneyEarned.ContainsKey(CurrentRound.Number))
								player.RoundsMoneyEarned[CurrentRound.Number] = WIN_ELIMINATION;
							else
								player.RoundsMoneyEarned[CurrentRound.Number] += WIN_ELIMINATION;
						}
						else
						{
							switch (looser.LossRowCount)
							{
								case 1:
									if (!player.RoundsMoneyEarned.ContainsKey(CurrentRound.Number))
										player.RoundsMoneyEarned[CurrentRound.Number] = CurrentRound.BombPlanted != null
											? LOSS_ROW_1 + BOMB_PLANTED_BONUS
											: LOSS_ROW_1;
									else
										player.RoundsMoneyEarned[CurrentRound.Number] += CurrentRound.BombPlanted != null
											? LOSS_ROW_1 + BOMB_PLANTED_BONUS
											: LOSS_ROW_1;
									break;
								case 2:
									if (!player.RoundsMoneyEarned.ContainsKey(CurrentRound.Number))
										player.RoundsMoneyEarned[CurrentRound.Number] = CurrentRound.BombPlanted != null
											? LOSS_ROW_2 + BOMB_PLANTED_BONUS
											: LOSS_ROW_2;
									else
										player.RoundsMoneyEarned[CurrentRound.Number] += CurrentRound.BombPlanted != null
											? LOSS_ROW_2 + BOMB_PLANTED_BONUS
											: LOSS_ROW_2;
									break;
								case 3:
									if (!player.RoundsMoneyEarned.ContainsKey(CurrentRound.Number))
										player.RoundsMoneyEarned[CurrentRound.Number] = CurrentRound.BombPlanted != null
											? LOSS_ROW_3 + BOMB_PLANTED_BONUS
											: LOSS_ROW_3;
									else
										player.RoundsMoneyEarned[CurrentRound.Number] += CurrentRound.BombPlanted != null
											? LOSS_ROW_3 + BOMB_PLANTED_BONUS
											: LOSS_ROW_3;
									break;
								case 4:
									if (!player.RoundsMoneyEarned.ContainsKey(CurrentRound.Number))
										player.RoundsMoneyEarned[CurrentRound.Number] = CurrentRound.BombPlanted != null
											? LOSS_ROW_4 + BOMB_PLANTED_BONUS
											: LOSS_ROW_4;
									else
										player.RoundsMoneyEarned[CurrentRound.Number] += CurrentRound.BombPlanted != null
											? LOSS_ROW_4 + BOMB_PLANTED_BONUS
											: LOSS_ROW_4;
									break;
								default:
									if (!player.RoundsMoneyEarned.ContainsKey(CurrentRound.Number))
										player.RoundsMoneyEarned[CurrentRound.Number] = CurrentRound.BombPlanted != null
											? LOSS_ROW_5 + BOMB_PLANTED_BONUS
											: LOSS_ROW_5;
									else
										player.RoundsMoneyEarned[CurrentRound.Number] += CurrentRound.BombPlanted != null
											? LOSS_ROW_5 + BOMB_PLANTED_BONUS
											: LOSS_ROW_5;
									break;
							}
						}
						break;
					case RoundEndReason.TerroristWin:
						if (player.Side == Side.Terrorist)
						{
							if (!player.RoundsMoneyEarned.ContainsKey(CurrentRound.Number))
								player.RoundsMoneyEarned[CurrentRound.Number] = WIN_ELIMINATION;
							else
								player.RoundsMoneyEarned[CurrentRound.Number] += WIN_ELIMINATION;
						}
						else
							UpdateLooserMoneyReward(looser, player);
						break;
					case RoundEndReason.TargetSaved:
						if (player.Side == Side.CounterTerrorist)
						{
							if (!player.RoundsMoneyEarned.ContainsKey(CurrentRound.Number))
								player.RoundsMoneyEarned[CurrentRound.Number] = WIN_TIME_OVER;
							else
								player.RoundsMoneyEarned[CurrentRound.Number] += WIN_TIME_OVER;
						}
						else
							if (!player.IsAlive) UpdateLooserMoneyReward(looser, player);
						break;
				}
			}
		}

		private void UpdateLooserMoneyReward(Team looser, Player player)
		{
			switch (looser.LossRowCount)
			{
				case 1:
					if (!player.RoundsMoneyEarned.ContainsKey(CurrentRound.Number))
						player.RoundsMoneyEarned[CurrentRound.Number] = LOSS_ROW_1;
					else
						player.RoundsMoneyEarned[CurrentRound.Number] += LOSS_ROW_1;
					break;
				case 2:
					if (!player.RoundsMoneyEarned.ContainsKey(CurrentRound.Number))
						player.RoundsMoneyEarned[CurrentRound.Number] = LOSS_ROW_2;
					else
						player.RoundsMoneyEarned[CurrentRound.Number] += LOSS_ROW_2;
					break;
				case 3:
					if (!player.RoundsMoneyEarned.ContainsKey(CurrentRound.Number))
						player.RoundsMoneyEarned[CurrentRound.Number] = LOSS_ROW_3;
					else
						player.RoundsMoneyEarned[CurrentRound.Number] += LOSS_ROW_3;
					break;
				case 4:
					if (!player.RoundsMoneyEarned.ContainsKey(CurrentRound.Number))
						player.RoundsMoneyEarned[CurrentRound.Number] = LOSS_ROW_4;
					else
						player.RoundsMoneyEarned[CurrentRound.Number] += LOSS_ROW_4;
					break;
				default:
					if (!player.RoundsMoneyEarned.ContainsKey(CurrentRound.Number))
						player.RoundsMoneyEarned[CurrentRound.Number] = LOSS_ROW_5;
					else
						player.RoundsMoneyEarned[CurrentRound.Number] += LOSS_ROW_5;
					break;
			}
		}

		protected void ProcessAnalyzeEnded()
		{
			// As round_officialy_ended isn't raised we add the last round / OT after the analyze
			if (Demo.Rounds.Count < Demo.ScoreTeam1 + Demo.ScoreTeam2)
			{
				UpdateKillsCount();
				Application.Current.Dispatcher.Invoke(() => Demo.Rounds.Add(CurrentRound));
				// Add last overtime if there was an overtime at the end
				if (IsOvertime) Application.Current.Dispatcher.Invoke(() => Demo.Overtimes.Add(CurrentOvertime));
			}

			Demo.Winner = Demo.ScoreTeam1 > Demo.ScoreTeam2 ? Demo.TeamCT : Demo.TeamT;

			if (Demo.Players.Any())
			{
				UpdatePlayerScore();
				ProcessPlayersRating();
				Demo.MostHeadshotPlayer = Demo.Players.OrderByDescending(x => x.HeadshotPercent).First();
				Demo.MostBombPlantedPlayer = Demo.Players.OrderByDescending(x => x.BombPlantedCount).First();
				Demo.MostEntryKillPlayer = Demo.Players.OrderByDescending(x => x.EntryKills.Count).First();
			}
			if (Demo.Kills.Any())
			{
				var weapons = Demo.Kills.GroupBy(k => k.Weapon).Select(weap => new
				{
					Weapon = weap.Key,
					Count = weap.Count()
				}).OrderByDescending(w => w.Count);
				if (weapons.Any()) Demo.MostKillingWeapon = weapons.Select(w => w.Weapon).First();
			}

			if (AnalyzePlayersPosition)
			{
				LastPlayersFireEndedMolotov.Clear();
			}
		}

		#endregion
	}
}
