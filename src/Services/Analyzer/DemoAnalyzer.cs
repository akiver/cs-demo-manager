using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Events;
using CSGO_Demos_Manager.Models.Source;
using DemoInfo;
using DemoInfo.Messages;
using ProtoBuf;

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
		public bool IsLastRoundHalf { get; set; }
		public bool IsSwapTeamRequired { get; set; } = false;
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

		public Dictionary<Player, int> KillsThisRound { get; set; } = new Dictionary<Player, int>();

		private PlayerExtended _playerInClutch1 = null;
		private PlayerExtended _playerInClutch2 = null;

		private static readonly Regex LocalRegex = new Regex("^[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]+(\\:[0-9]{1,5})?$");
		private static readonly Regex FILENAME_FACEIT_REGEX = new Regex("^[0-9]+_team[a-z0-9-]+-team[a-z0-9-]+_de_[a-z0-9]+\\.dem");
		private static readonly Regex FILENAME_EBOT_REGEX = new Regex("^([0-9]*)_(.*?)-(.*?)_(.*?)(.dem)$");

		public bool AnalyzeHeatmapPoint { get; set; } = false;
		public bool AnalyzePlayersPosition { get; set; } = false;
		public bool AnalyzeFlashbang { get; set; } = false;

		// HTLV rating variables http://www.hltv.org/?pageid=242&eventid=0
		const double AVERAGE_KPR = 0.679; // average kills per round
		const double AVERAGE_SPR = 0.317; // average survived rounds per round
		const double AVERAGE_RMK = 1.277; // average value calculated from rounds with multiple kills

		/// <summary>
		/// As molotov thrower isn't networked eveytime, this 3 queues are used to know who throw a moloto
		/// </summary>
		public readonly Queue<PlayerExtended> LastPlayersThrowedMolotov = new Queue<PlayerExtended>();

		public readonly Queue<PlayerExtended> LastPlayersFireStartedMolotov = new Queue<PlayerExtended>();

		public readonly Queue<PlayerExtended> LastPlayersFireEndedMolotov = new Queue<PlayerExtended>();

		/// <summary>
		/// Last player who throwed a flashbang, used for flashbangs stats
		/// </summary>
		public PlayerExtended LastPlayerExplodedFlashbang { get; set; }

		public Queue<PlayerExtended> PlayersFlashQueue = new Queue<PlayerExtended>();

		#endregion

		public abstract Task<Demo> AnalyzeDemoAsync(CancellationToken token);

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

			// Read .info file to get the real match date
			string infoFilePath = demo.Path + ".info";
			if (File.Exists(infoFilePath))
			{
				using (FileStream file = File.OpenRead(infoFilePath))
				{
					try
					{
						CDataGCCStrike15_v2_MatchInfo infoMsg = Serializer.Deserialize<CDataGCCStrike15_v2_MatchInfo>(file);
						DateTime unixTime = new DateTime(1970, 1, 1, 0, 0, 0, 0);
						demo.Date = unixTime.AddSeconds(infoMsg.matchtime);
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
			if (demo.Name.Contains("esea"))
			{
				return Source.Factory("esea");
			}

			// Check for faceit demos
			// (Before May 2015) Faceit : uses regex - no false positive but could miss some Faceit demo (when premade playing because of custom team name)
			// (May 2015) Faceit : uses hostname
			if (demo.Hostname.Contains("FACEIT.com") || FILENAME_FACEIT_REGEX.Match(demo.Name).Success)
			{
				return Source.Factory("faceit");
			}

			// Check for cevo demos
			if (demo.Hostname.Contains("CEVO.com"))
			{
				return Source.Factory("cevo");
			}

			// Check for ebot demos
			if (demo.Hostname.Contains("eBot") || FILENAME_EBOT_REGEX.Match(demo.Name).Success)
			{
				return Source.Factory("ebot");
			}

			if (demo.Name.IndexOf("popflash", StringComparison.OrdinalIgnoreCase) >= 0 ||
				demo.Hostname.IndexOf("popflash", StringComparison.OrdinalIgnoreCase) >= 0)
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
				foreach (Player player in Parser.PlayingParticipants)
				{
					PlayerExtended pl = Demo.Players.FirstOrDefault(p => p.SteamId == player.SteamID);
					if (pl != null && player.FlashDuration >= pl.FlashDurationTemp)
					{
						PlayerBlindedEvent playerBlindedEvent = new PlayerBlindedEvent(Parser.CurrentTick)
						{
							Thrower = LastPlayerExplodedFlashbang,
							Victim = pl,
							Round = CurrentRound,
							Duration = player.FlashDuration - pl.FlashDurationTemp
						};
						Demo.PlayerBlindedEvents.Add(playerBlindedEvent);
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
					foreach (PlayerExtended playerExtended in Demo.Players)
					{
						playerExtended.HasBomb = false;
					}

					// Update players position
					foreach (Player player in Parser.PlayingParticipants)
					{
						if (!player.IsAlive) continue;
						PlayerExtended pl = Demo.Players.FirstOrDefault(p => p.SteamId == player.SteamID);
						if (pl == null || pl.SteamId == 0) continue;

						// Set the bomber
						if (player.Weapons.FirstOrDefault(w => w.Weapon == EquipmentElement.Bomb) != null) pl.HasBomb = true;

						PositionPoint positionPoint = new PositionPoint
						{
							X = player.Position.X,
							Y = player.Position.Y,
							Round = CurrentRound,
							Team = player.Team,
							Player = pl.Clone()
						};
						Demo.PositionsPoint.Add(positionPoint);
					}
				}
			}
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

			CheckForSpecialClutchEnd();
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
			if (!IsMatchStarted) return;

			BombPlantedEvent bombPlantedEvent = new BombPlantedEvent(Parser.IngameTick);
			if (e.Player.SteamID != 0)
			{
				PlayerExtended player = Demo.Players.FirstOrDefault(p => p.SteamId == e.Player.SteamID);
				if (player != null)
				{
					player.BombPlantedCount++;
					bombPlantedEvent.Player = player;
					bombPlantedEvent.X = e.Player.Position.X;
					bombPlantedEvent.Y = e.Player.Position.Y;
				}
			}
			bombPlantedEvent.Site = e.Site.ToString();
			Demo.BombPlanted.Add(bombPlantedEvent);
			CurrentRound.BombPlanted.Add(bombPlantedEvent);

			if (AnalyzePlayersPosition && bombPlantedEvent.Player != null)
			{
				PositionPoint positionPoint = new PositionPoint
				{
					X = Demo.BombPlanted.Last().X,
					Y = Demo.BombPlanted.Last().Y,
					Player = bombPlantedEvent.Player,
					Team = e.Player.Team,
					Event = bombPlantedEvent,
					Round = CurrentRound
				};
				Demo.PositionsPoint.Add(positionPoint);
			}
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
			Demo.BombDefused.Add(bombDefusedEvent);
			CurrentRound.BombDefused.Add(bombDefusedEvent);

			if (AnalyzePlayersPosition && bombDefusedEvent.Player != null)
			{
				PositionPoint positionPoint = new PositionPoint
				{
					X = Demo.BombPlanted.Last().X,
					Y = Demo.BombPlanted.Last().Y,
					Player = bombDefusedEvent.Player,
					Team = e.Player.Team,
					Event = bombDefusedEvent,
					Round = CurrentRound
				};
				Demo.PositionsPoint.Add(positionPoint);
			}
		}

		protected void HandleBombExploded(object sender, BombEventArgs e)
		{
			if (!IsMatchStarted) return;

			BombExplodedEvent bombExplodedEvent = new BombExplodedEvent(Parser.IngameTick)
			{
				Site = e.Site.ToString()
			};

			if (e.Player != null) bombExplodedEvent.Player = Demo.Players.FirstOrDefault(p => p.SteamId == e.Player.SteamID);

			Demo.BombExploded.Add(bombExplodedEvent);
			CurrentRound.BombExploded.Add(bombExplodedEvent);

			if (AnalyzePlayersPosition && bombExplodedEvent.Player != null)
			{
				PositionPoint positionPoint = new PositionPoint
				{
					X = Demo.BombPlanted.Last().X,
					Y = Demo.BombPlanted.Last().Y,
					Player = bombExplodedEvent.Player,
					Team = e.Player.Team,
					Event = bombExplodedEvent,
					Round = CurrentRound
				};
				Demo.PositionsPoint.Add(positionPoint);
			}
		}

		protected void HandleWeaponFired(object sender, WeaponFiredEventArgs e)
		{
			if (!IsMatchStarted || e.Shooter == null) return;

			if (!IsFirstShotOccured)
			{
				IsFirstShotOccured = true;
				if (IsHalfMatch)
				{
					CurrentRound.EquipementValueTeam1 = Parser.Participants.Where(a => a.Team == Team.Terrorist).Sum(a => a.CurrentEquipmentValue);
					CurrentRound.EquipementValueTeam2 = Parser.Participants.Where(a => a.Team == Team.CounterTerrorist).Sum(a => a.CurrentEquipmentValue);
				}
				else
				{
					CurrentRound.EquipementValueTeam1 = Parser.Participants.Where(a => a.Team == Team.CounterTerrorist).Sum(a => a.CurrentEquipmentValue);
					CurrentRound.EquipementValueTeam2 = Parser.Participants.Where(a => a.Team == Team.Terrorist).Sum(a => a.CurrentEquipmentValue);
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
									CurrentRound.TeamTrouble = Demo.TeamCT;
									CurrentRound.SideTrouble = Team.CounterTerrorist;
								}
								else
								{
									CurrentRound.TeamTrouble = Demo.TeamT;
									CurrentRound.SideTrouble = Team.Terrorist;
								}
							}
							else
							{
								if (CurrentRound.EquipementValueTeam1 > CurrentRound.EquipementValueTeam2)
								{
									CurrentRound.TeamTrouble = Demo.TeamT;
									CurrentRound.SideTrouble = Team.CounterTerrorist;
								}
								else
								{
									CurrentRound.TeamTrouble = Demo.TeamCT;
									CurrentRound.SideTrouble = Team.Terrorist;
								}
							}
						}
						else
						{
							if (IsHalfMatch)
							{
								if (CurrentRound.EquipementValueTeam1 > CurrentRound.EquipementValueTeam2)
								{
									CurrentRound.TeamTrouble = Demo.TeamCT;
									CurrentRound.SideTrouble = Team.Terrorist;
								}
								else
								{
									CurrentRound.TeamTrouble = Demo.TeamT;
									CurrentRound.SideTrouble = Team.CounterTerrorist;
								}
							}
							else
							{
								if (CurrentRound.EquipementValueTeam1 > CurrentRound.EquipementValueTeam2)
								{
									CurrentRound.TeamTrouble = Demo.TeamT;
									CurrentRound.SideTrouble = Team.Terrorist;
								}
								else
								{
									CurrentRound.TeamTrouble = Demo.TeamCT;
									CurrentRound.SideTrouble = Team.CounterTerrorist;
								}
							}
						}
					}
						
				}
			}

			if (AnalyzeHeatmapPoint || AnalyzePlayersPosition)
			{
				WeaponFire shoot = new WeaponFire(Parser.IngameTick)
				{
					Shooter = Demo.Players.FirstOrDefault(p => p.SteamId == e.Shooter.SteamID),
					Weapon = new Weapon(e.Weapon)
				};

				if (AnalyzeHeatmapPoint && shoot.Shooter != null)
				{
					shoot.Point = new HeatmapPoint
					{
						X = e.Shooter.Position.X,
						Y = e.Shooter.Position.Y,
						Round = CurrentRound,
						Player = shoot.Shooter,
						Team = e.Shooter.Team
					};
				}

				Demo.WeaponFired.Add(shoot);

				if (AnalyzePlayersPosition || AnalyzeHeatmapPoint && shoot.Shooter != null)
				{
					if (e.Shooter.SteamID == 0) return;

					switch (e.Weapon.Weapon)
					{
						case EquipmentElement.Incendiary:
						case EquipmentElement.Molotov:
							LastPlayersThrowedMolotov.Enqueue(Demo.Players.First(p => p.SteamId == e.Shooter.SteamID));
							if (AnalyzeHeatmapPoint) return;
							goto case EquipmentElement.Decoy;
						case EquipmentElement.Decoy:
						case EquipmentElement.Flash:
						case EquipmentElement.HE:
						case EquipmentElement.Smoke:
							PositionPoint positionPoint = new PositionPoint
							{
								X = e.Shooter.Position.X,
								Y = e.Shooter.Position.Y,
								Player = Demo.Players.First(p => p.SteamId == e.Shooter.SteamID),
								Team = e.Shooter.Team,
								Event = shoot,
								Round = CurrentRound
							};
							Demo.PositionsPoint.Add(positionPoint);
							break;
					}
				}
			}
			else
			{
				PlayerExtended shooter = Demo.Players.FirstOrDefault(p => p.SteamId == e.Shooter.SteamID);
				if (shooter == null) return;
				
				switch (e.Weapon.Weapon)
				{
					case EquipmentElement.Incendiary:
						shooter.IncendiaryThrowedCount++;
						break;
					case EquipmentElement.Molotov:
						shooter.MolotovThrowedCount++;
						break;
					case EquipmentElement.Decoy:
						shooter.DecoyThrowedCount++;
						break;
					case EquipmentElement.Flash:
						shooter.FlashbangThrowedCount++;
						PlayersFlashQueue.Enqueue(shooter);
						break;
					case EquipmentElement.HE:
						shooter.HeGrenadeThrowedCount++;
						break;
					case EquipmentElement.Smoke:
						shooter.SMokeThrowedCount++;
						break;
				}
			}
		}

		protected void HandleFireNadeStarted(object sender, FireEventArgs e)
		{
			if (!AnalyzePlayersPosition && !AnalyzeHeatmapPoint || !IsMatchStarted) return;

			switch (e.NadeType)
			{
				case EquipmentElement.Incendiary:
				case EquipmentElement.Molotov:
					MolotovFireStartedEvent molotovEvent = new MolotovFireStartedEvent(Parser.IngameTick);
					PlayerExtended thrower = null;
					
					if (e.ThrownBy != null)
					{
						thrower = Demo.Players.First(p => p.SteamId == e.ThrownBy.SteamID);
					}

					if (AnalyzePlayersPosition || AnalyzeHeatmapPoint && LastPlayersThrowedMolotov.Any())
					{
						LastPlayersFireStartedMolotov.Enqueue(LastPlayersThrowedMolotov.Peek());
						// Remove the last player who throwed a molo
						thrower = LastPlayersThrowedMolotov.Dequeue();
					}

					molotovEvent.Thrower = thrower;
					if (AnalyzePlayersPosition)
					{
						PositionPoint positionPoint = new PositionPoint
						{
							X = e.Position.X,
							Y = e.Position.Y,
							Player = thrower,
							Team = thrower?.Side ?? Team.Spectate,
							Event = molotovEvent,
							Round = CurrentRound
						};
						Demo.PositionsPoint.Add(positionPoint);
					}

					if (AnalyzeHeatmapPoint)
					{
						molotovEvent.Point = new HeatmapPoint
						{
							X = e.Position.X,
							Y = e.Position.Y,
							Player = thrower,
							Team = thrower?.Side ?? Team.Spectate,
							Round = CurrentRound
						};
						Demo.MolotovFireStarted.Add(molotovEvent);
					}
					
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
					MolotovFireEndedEvent molotovEvent = new MolotovFireEndedEvent(Parser.IngameTick)
					{
						Point = new HeatmapPoint
						{
							X = e.Position.X,
							Y = e.Position.Y
						}
					};

					PlayerExtended thrower = null;

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

					molotovEvent.Thrower = thrower;
					CurrentRound.MolotovsThrowed.Add(molotovEvent);

					PositionPoint positionPoint = new PositionPoint
					{
						X = e.Position.X,
						Y = e.Position.Y,
						Player = thrower,
						Team = thrower?.Side ?? Team.Spectate,
						Event = molotovEvent,
						Round = CurrentRound
					};
					Demo.PositionsPoint.Add(positionPoint);
					
					break;
			}
		}

		protected void HandleExplosiveNadeExploded(object sender, GrenadeEventArgs e)
		{
			if (!AnalyzePlayersPosition && !AnalyzeHeatmapPoint || !IsMatchStarted || e.ThrownBy == null) return;

			ExplosiveNadeExplodedEvent explosiveEvent = new ExplosiveNadeExplodedEvent(Parser.IngameTick)
			{
				Thrower = Demo.Players.FirstOrDefault(player => player.SteamId == e.ThrownBy.SteamID)
			};

			if (AnalyzeHeatmapPoint && explosiveEvent.Thrower != null)
			{
				explosiveEvent.Point = new HeatmapPoint
				{
					X = e.Position.X,
					Y = e.Position.Y,
					Player = explosiveEvent.Thrower,
					Team = e.ThrownBy.Team,
					Round = CurrentRound
				};
			}

			CurrentRound.ExplosiveGrenadesExploded.Add(explosiveEvent);

			if (AnalyzePlayersPosition && explosiveEvent.Thrower != null)
			{
				PositionPoint positionPoint = new PositionPoint
				{
					X = e.Position.X,
					Y = e.Position.Y,
					Player = Demo.Players.First(p => p.SteamId == e.ThrownBy.SteamID),
					Team = e.ThrownBy.Team,
					Event = explosiveEvent,
					Round = CurrentRound
				};
				Demo.PositionsPoint.Add(positionPoint);
			}
		}

		protected void HandleFlashNadeExploded(object sender, FlashEventArgs e)
		{
			if(!IsMatchStarted || e.ThrownBy == null || !PlayersFlashQueue.Any()) return;

			if (PlayersFlashQueue.Any())
			{
				LastPlayerExplodedFlashbang = PlayersFlashQueue.Dequeue();
				// update flash intensity value for each player when the flash poped
				foreach (Player player in Parser.PlayingParticipants)
				{
					PlayerExtended pl = Demo.Players.FirstOrDefault(p => p.SteamId == player.SteamID);
					if (pl != null) pl.FlashDurationTemp = player.FlashDuration;
				}
				// set it to true to start analyzing flashbang status at each tick
				AnalyzeFlashbang = true;
			}

			if (!AnalyzePlayersPosition && !AnalyzeHeatmapPoint) return;

			FlashbangExplodedEvent flashbangEvent = new FlashbangExplodedEvent(Parser.IngameTick)
			{
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

			if (AnalyzeHeatmapPoint && flashbangEvent.Thrower != null)
			{
				flashbangEvent.Point = new HeatmapPoint
				{
					X = e.Position.X,
					Y = e.Position.Y,
					Player = flashbangEvent.Thrower,
					Team = e.ThrownBy.Team,
					Round = CurrentRound
				};
			}

			CurrentRound.FlashbangsExploded.Add(flashbangEvent);

			if (AnalyzePlayersPosition && flashbangEvent.Thrower != null)
			{
				PositionPoint positionPoint = new PositionPoint
				{
					X = e.Position.X,
					Y = e.Position.Y,
					Player = flashbangEvent.Thrower,
					Team = e.ThrownBy.Team,
					Round = CurrentRound,
					Event = flashbangEvent
				};
				Demo.PositionsPoint.Add(positionPoint);
			}
		}

		protected void HandleSmokeNadeStarted(object sender, SmokeEventArgs e)
		{
			if (!AnalyzePlayersPosition && !AnalyzeHeatmapPoint || !IsMatchStarted || e.ThrownBy == null) return;

			SmokeNadeStartedEvent smokeEvent = new SmokeNadeStartedEvent(Parser.IngameTick)
			{
				Thrower = Demo.Players.FirstOrDefault(player => player.SteamId == e.ThrownBy.SteamID)
			};

			if (AnalyzeHeatmapPoint && smokeEvent.Thrower != null)
			{
				smokeEvent.Point = new HeatmapPoint
				{
					X = e.Position.X,
					Y = e.Position.Y,
					Player = smokeEvent.Thrower,
					Team = e.ThrownBy.Team,
					Round = CurrentRound
				};
			}

			CurrentRound.SmokesStarted.Add(smokeEvent);

			if (AnalyzePlayersPosition && smokeEvent.Thrower != null)
			{
				PositionPoint positionPoint = new PositionPoint
				{
					X = e.Position.X,
					Y = e.Position.Y,
					Player = smokeEvent.Thrower,
					Team = e.ThrownBy.Team,
					Event = smokeEvent,
					Round = CurrentRound
				};
				Demo.PositionsPoint.Add(positionPoint);
			}
		}

		protected void HandleSmokeNadeEnded(object sender, SmokeEventArgs e)
		{
			if (!AnalyzePlayersPosition || !IsMatchStarted || e.ThrownBy == null) return;

			SmokeNadeEndedEvent smokeEvent = new SmokeNadeEndedEvent(Parser.IngameTick)
			{
				Thrower = Demo.Players.FirstOrDefault(player => player.SteamId == e.ThrownBy.SteamID)
			};

			if (smokeEvent.Thrower != null)
			{
				PositionPoint positionPoint = new PositionPoint
				{
					X = e.Position.X,
					Y = e.Position.Y,
					Player = Demo.Players.First(p => p.SteamId == e.ThrownBy.SteamID),
					Team = e.ThrownBy.Team,
					Event = smokeEvent,
					Round = CurrentRound
				};
				Demo.PositionsPoint.Add(positionPoint);
			}
		}

		protected void HandleDecoyNadeStarted(object sender, DecoyEventArgs e)
		{
			if (!AnalyzePlayersPosition && !AnalyzeHeatmapPoint || !IsMatchStarted) return;
		
			DecoyStartedEvent decoyStartedEvent = new DecoyStartedEvent(Parser.IngameTick)
			{
				Thrower = Demo.Players.FirstOrDefault(player => player.SteamId == e.ThrownBy.SteamID)
			};

			if (AnalyzeHeatmapPoint && decoyStartedEvent.Thrower != null)
			{
				decoyStartedEvent.Point = new HeatmapPoint
				{
					X = e.Position.X,
					Y = e.Position.Y,
					Player = decoyStartedEvent.Thrower,
					Team = e.ThrownBy.Team,
					Round = CurrentRound
				};
				Demo.DecoyStarted.Add(decoyStartedEvent);
			}

			if (AnalyzePlayersPosition && decoyStartedEvent.Thrower != null)
			{
				PositionPoint positionPoint = new PositionPoint
				{
					X = e.Position.X,
					Y = e.Position.Y,
					Player = Demo.Players.First(p => p.SteamId == e.ThrownBy.SteamID),
					Team = e.ThrownBy.Team,
					Event = decoyStartedEvent,
					Round = CurrentRound
				};
				Demo.PositionsPoint.Add(positionPoint);
			}
		}

		protected void HandleDecoyNadeEnded(object sender, DecoyEventArgs e)
		{
			if (!AnalyzePlayersPosition || !IsMatchStarted) return;

			DecoyEndedEvent decoyEndedEvent = new DecoyEndedEvent(Parser.IngameTick)
			{
				Thrower = Demo.Players.FirstOrDefault(player => player.SteamId == e.ThrownBy.SteamID)
			};

			if (decoyEndedEvent.Thrower != null)
			{
				PositionPoint positionPoint = new PositionPoint
				{
					X = e.Position.X,
					Y = e.Position.Y,
					Player = Demo.Players.First(p => p.SteamId == e.ThrownBy.SteamID),
					Team = e.ThrownBy.Team,
					Event = decoyEndedEvent,
					Round = CurrentRound
				};
				Demo.PositionsPoint.Add(positionPoint);
			}
		}

		protected void HandleRoundMvp(object sender, RoundMVPEventArgs e)
		{
			if (!IsMatchStarted) return;

			if (e.Player.SteamID == 0) return;
			PlayerExtended playerMvp = Demo.Players.FirstOrDefault(player => player.SteamId == e.Player.SteamID);
			if (playerMvp != null) playerMvp.RoundMvpCount++;
		}

		/// <summary>
		/// When a player is hurted
		/// Trigerred only with demos > 6/30/2015
		/// </summary>
		/// <param name="sender"></param>
		/// <param name="e"></param>
		protected void HandlePlayerHurted(object sender, PlayerHurtEventArgs e)
		{
			if (!IsMatchStarted) return;

			// may be a bot on MM demos
			PlayerExtended hurted = Demo.Players.FirstOrDefault(player => player.SteamId == e.Player.SteamID);
			if (hurted == null) return;
			PlayerExtended attacker = null;
			// attacker may be null (hurted by world)
			if (e.Attacker != null) attacker = Demo.Players.FirstOrDefault(player => player.SteamId == e.Attacker.SteamID);

			PlayerHurtedEvent playerHurtedEvent = new PlayerHurtedEvent(Parser.IngameTick)
			{
				Attacker = attacker,
				Hurted = hurted,
				Armor = e.Armor,
				ArmorDamage = e.ArmorDamage,
				Health = e.Health,
				HealthDamage = e.HealthDamage,
				HitGroup = e.Hitgroup,
				Weapon = new Weapon(e.Weapon),
				RoundNumber = CurrentRound.Number
			};

			attacker?.PlayersHurted.Add(playerHurtedEvent);
			hurted?.PlayersHurted.Add(playerHurtedEvent);
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
			PlayerExtended playerDisconnected = Demo.Players.FirstOrDefault(p => p.SteamId == e.Player.SteamID);
			if (playerDisconnected == null) return;
			playerDisconnected.IsAlive = false;
			playerDisconnected.Side = Team.Spectate;
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
			IsFirstShotOccured = false;
			_playerInClutch1 = null;
			_playerInClutch2 = null;

			KillsThisRound.Clear();

			// Nobody is controlling a BOT at the beginning of a round
			foreach (PlayerExtended pl in Demo.Players)
			{
				pl.OpponentClutchCount = 0;
				pl.HasEntryKill = false;
				pl.HasOpeningKill = false;
				pl.IsControllingBot = false;
				Player player = Parser.PlayingParticipants.FirstOrDefault(p => p.SteamID == pl.SteamId);
				if (player != null)
				{
					pl.RoundPlayedCount++;
					pl.IsAlive = true;
					pl.Side = player.Team;
				}
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
				pl.Side = pl.Side == Team.Terrorist ? Team.CounterTerrorist : Team.Terrorist;
			}
		}

		/// <summary>
		/// Check if there is any clutch situation and if so add clutch to player
		/// </summary>
		protected void ProcessClutches()
		{
			int terroristAliveCount = Demo.Players.Count(p => p.Side == Team.Terrorist && p.IsAlive);
			int counterTerroristAliveCount = Demo.Players.Count(p => p.Side == Team.CounterTerrorist && p.IsAlive);

			// First dectection of a 1vX situation, a terro is in clutch
			if (_playerInClutch1 == null && terroristAliveCount == 1)
			{
				// Set the number of opponent in his clutch
				_playerInClutch1 = Demo.Players.FirstOrDefault(p => p.Side == Team.Terrorist && p.IsAlive);
				if (_playerInClutch1 != null && _playerInClutch1.OpponentClutchCount == 0)
				{
					_playerInClutch1.OpponentClutchCount = Demo.Players.Count(p => p.Side == Team.CounterTerrorist && p.IsAlive);
					_playerInClutch1.ClutchCount++;
					return;
				}
			}

			// First dectection of a 1vX situation, a CT is in clutch
			if (_playerInClutch1 == null && counterTerroristAliveCount == 1)
			{
				_playerInClutch1 = Demo.Players.FirstOrDefault(p => p.Side == Team.CounterTerrorist && p.IsAlive);
				if (_playerInClutch1 != null && _playerInClutch1.OpponentClutchCount == 0)
				{
					_playerInClutch1.OpponentClutchCount = Demo.Players.Count(p => p.Side == Team.Terrorist && p.IsAlive);
					_playerInClutch1.ClutchCount++;
					return;
				}
			}

			// 1v1 detection
			if (counterTerroristAliveCount == 1 && terroristAliveCount == 1 && _playerInClutch1 != null)
			{
				Team player2Team = _playerInClutch1.Side == Team.CounterTerrorist ? Team.Terrorist : Team.CounterTerrorist;
				_playerInClutch2 = Demo.Players.FirstOrDefault(p => p.Side == player2Team && p.IsAlive);
				if (_playerInClutch2 == null) return;
				_playerInClutch2.ClutchCount++;
				_playerInClutch2.OpponentClutchCount = 1;
			}
		}

		/// <summary>
		/// Calculate HLTV rating for each players
		/// </summary>
		protected void ProcessPlayersRating()
		{
			foreach (PlayerExtended player in Demo.Players)
			{
				player.RatingHltv = (float)ComputeHltvOrgRating(Demo.Rounds.Count, player.KillsCount, player.DeathCount, new int[5]
				{
					player.OnekillCount, player.TwokillCount, player.ThreekillCount, player.FourKillCount, player.FiveKillCount
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

		protected void ProcessOpenAndEntryKills(KillEvent killEvent)
		{
			if (killEvent.DeathPerson == null || killEvent.Killer == null) return;

			if (IsEntryKillDone) return;

			if (IsOpeningKillDone) return;

			if (killEvent.Killer.Side == Team.Terrorist)
			{
				// This is an entry kill
				Application.Current.Dispatcher.Invoke(delegate
				{
					killEvent.Killer.HasEntryKill = true;
					killEvent.Killer.HasOpeningKill = true;

					CurrentRound.EntryKillEvent = new EntryKillEvent(Parser.IngameTick)
					{
						Killed = Demo.Players.First(p => Equals(p, killEvent.DeathPerson)),
						KilledTeam = killEvent.DeathPerson.Side,
						Killer = Demo.Players.First(p => Equals(p, killEvent.Killer)),
						KillerTeam = killEvent.Killer.Side,
						Weapon = killEvent.Weapon
					};
					CurrentRound.OpenKillEvent = new OpenKillEvent(Parser.IngameTick)
					{
						Killer = Demo.Players.First(p => Equals(p, killEvent.Killer)),
						KilledTeam = killEvent.DeathPerson.Side,
						Killed = Demo.Players.First(p => Equals(p, killEvent.DeathPerson)),
						KillerTeam = killEvent.Killer.Side,
						Weapon = killEvent.Weapon
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
					Killer = Demo.Players.First(p => Equals(p, killEvent.Killer)),
					KilledTeam = killEvent.DeathPerson.Side,
					Killed = Demo.Players.First(p => Equals(p, killEvent.DeathPerson)),
					KillerTeam = killEvent.Killer.Side,
					Weapon = killEvent.Weapon
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
						CurrentRound.WinnerClanName = Demo.TeamT.Name;
					}
					else
					{
						CurrentOvertime.ScoreTeam1++;
						Demo.ScoreTeam1++;
						CurrentRound.WinnerClanName = Demo.TeamCT.Name;
					}
				}
				else
				{
					if (roundEndedEventArgs.Winner == Team.CounterTerrorist)
					{
						CurrentOvertime.ScoreTeam2++;
						Demo.ScoreTeam2++;
						CurrentRound.WinnerClanName = Demo.TeamT.Name;
					}
					else
					{
						CurrentOvertime.ScoreTeam1++;
						Demo.ScoreTeam1++;
						CurrentRound.WinnerClanName = Demo.TeamCT.Name;
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
						CurrentRound.WinnerClanName = Demo.TeamCT.Name;
					}
					else
					{
						Demo.ScoreSecondHalfTeam2++;
						Demo.ScoreTeam2++;
						CurrentRound.WinnerClanName = Demo.TeamT.Name;
					}
				}
				else
				{
					if (roundEndedEventArgs.Winner == Team.CounterTerrorist)
					{
						Demo.ScoreFirstHalfTeam1++;
						Demo.ScoreTeam1++;
						CurrentRound.WinnerClanName = Demo.TeamCT.Name;
					}
					else
					{
						Demo.ScoreFirstHalfTeam2++;
						Demo.ScoreTeam2++;
						CurrentRound.WinnerClanName = Demo.TeamT.Name;
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
			// 1vX
			if (_playerInClutch1 != null && _playerInClutch2 == null)
			{
				if (_playerInClutch1.Side == Team.Terrorist && CurrentRound.Winner == Team.Terrorist
					|| _playerInClutch1.Side == Team.CounterTerrorist && CurrentRound.Winner == Team.CounterTerrorist)
				{
					// T won the clutch
					UpdatePlayerClutchCount(_playerInClutch1);
					if (_playerInClutch2 != null) _playerInClutch2.ClutchLostCount++;
				}
			} else if (_playerInClutch1 != null && _playerInClutch2 != null)
			{
				// 1V1
				switch (CurrentRound.Winner)
				{
					case Team.CounterTerrorist:
						if (_playerInClutch1.Side == Team.CounterTerrorist)
						{
							// CT won
							UpdatePlayerClutchCount(_playerInClutch1);
							_playerInClutch2.ClutchLostCount++;
						}
						else
						{
							// T won
							UpdatePlayerClutchCount(_playerInClutch2);
							_playerInClutch1.ClutchLostCount++;
						}
						break;
					case Team.Terrorist:
						if (_playerInClutch1.Side == Team.Terrorist)
						{
							// T won
							UpdatePlayerClutchCount(_playerInClutch1);
							_playerInClutch2.ClutchLostCount++;
						}
						else
						{
							// CT won
							UpdatePlayerClutchCount(_playerInClutch2);
							_playerInClutch1.ClutchLostCount++;
						}
						break;
				}
			}
		}

		private void UpdatePlayerClutchCount(PlayerExtended player)
		{
			switch (player.OpponentClutchCount)
			{
				case 1:
					player.Clutch1V1Count++;
					break;
				case 2:
					player.Clutch1V2Count++;
					break;
				case 3:
					player.Clutch1V3Count++;
					break;
				case 4:
					player.Clutch1V4Count++;
					break;
				case 5:
					player.Clutch1V5Count++;
					break;
			}
		}

		#endregion
	}
}
