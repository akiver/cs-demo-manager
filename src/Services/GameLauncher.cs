using CSGO_Demos_Manager.Models;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using CSGO_Demos_Manager.Exceptions.Launcher;
using CSGO_Demos_Manager.Models.Events;
using DemoInfo;

namespace CSGO_Demos_Manager.Services
{
	public class GameLauncher
	{
		private const double MAX_ACTION_INTERVAL_DELAY = 15.625;
		private const int NEXT_ACTION_DELAY = 2;
		private const int SWITCH_PLAYER_TICK_DELAY = 10;
		private const int STUFF_BEGIN_DELAY = 5;
		private const int STUFF_END_DELAY = 3;
		private const int MOLOTOV_TIME = 8;
		private readonly List<string> _arguments = new List<string>{"-applaunch 730", "-novid"};
		private readonly Process _process = new Process();
		private const string ARGUMENT_SEPARATOR = " ";

		public GameLauncher()
		{
			_process.StartInfo.FileName = AppSettings.SteamExePath();
			SetupResolutionParameters();
		}

		public void StartGame()
		{
			if (Properties.Settings.Default.MoviemakerMode)
			{
				if (!File.Exists(Properties.Settings.Default.CsgoExePath))
				{
					throw new CsgoNotFoundException();
				}
				string args = string.Join(ARGUMENT_SEPARATOR, _arguments.ToArray());
				args += " -steam -insecure +sv_lan 1 -game csgo " + Properties.Settings.Default.LaunchParameters;
				AfxCppCli.AfxHook.LauchAndHook(Properties.Settings.Default.CsgoExePath, args, Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location) + "\\AfxHookSource.dll");
			}
			else
			{
				Process[] currentProcess = Process.GetProcessesByName("csgo");
				if (currentProcess.Length > 0)
				{
					currentProcess[0].Kill();
				}

				string args = string.Join(ARGUMENT_SEPARATOR, _arguments.ToArray());
				_process.StartInfo.Arguments = args + " " + Properties.Settings.Default.LaunchParameters;
				_process.Start();
			}
		}

		public void WatchDemo(Demo demo)
		{
			_arguments.Add("+playdemo");
			_arguments.Add(demo.Path);
			DeleteVdmFile(demo);
			StartGame();
		}

		private void SetupResolutionParameters()
		{
			_arguments.Add("-w");
			_arguments.Add(Properties.Settings.Default.ResolutionWidth.ToString());
			_arguments.Add("-h");
			_arguments.Add(Properties.Settings.Default.ResolutionHeight.ToString());
			_arguments.Add(!Properties.Settings.Default.IsFullscreen ? "-windowed" : "-fullscreen");
		}

		private static void DeleteVdmFile(Demo demo)
		{
			string vdmPath = GetVdmFilePath(demo);
			if (File.Exists(demo.Path)) File.Delete(vdmPath);
		}

		internal void WatchHighlightDemo(Demo demo, bool fromPlayerPerspective, string steamId = null)
		{
			_arguments.Add("+playdemo");
			_arguments.Add(demo.Path);
			if (fromPlayerPerspective)
			{
				_arguments.Add(steamId ?? Properties.Settings.Default.WatchAccountSteamId.ToString());
				DeleteVdmFile(demo);
			}
			else
			{
				GenerateHighLowVdm(demo, true, steamId);
			}
			StartGame();
		}

		internal void WatchLowlightDemo(Demo demo, bool fromPlayerPerspective, string steamId = null)
		{
			_arguments.Add("+playdemo");
			_arguments.Add(demo.Path);
			if (fromPlayerPerspective)
			{
				GenerateHighLowVdm(demo, false, steamId);
			}
			else
			{
				_arguments.Add(steamId ?? Properties.Settings.Default.WatchAccountSteamId.ToString());
				_arguments.Add("lowlights");
				DeleteVdmFile(demo);
			}
			StartGame();
		}

		internal void WatchDemoAt(Demo demo, int tick, bool delay = false, int playerEntityId = -1)
		{
			_arguments.Add("+playdemo");
			int tickDelayCount = (int)(demo.ServerTickrate * MAX_ACTION_INTERVAL_DELAY);
			if (delay && tick > tickDelayCount) tick -= tickDelayCount;
			_arguments.Add(demo.Path + "@" + tick);
			if (playerEntityId != -1) GenerateSpecPlayerVdm(demo, tick, playerEntityId);
			DeleteVdmFile(demo);
			StartGame();
		}

		internal void WatchPlayerStuff(Demo demo, PlayerExtended player, string selectedType)
		{
			_arguments.Add("+playdemo");
			_arguments.Add(demo.Path);
			EquipmentElement type = EquipmentElement.Unknown;
			switch (selectedType)
			{
				case "smokes":
					type = EquipmentElement.Smoke;
					break;
				case "flashbangs":
					type = EquipmentElement.Flash;
					break;
				case "he":
					type = EquipmentElement.HE;
					break;
				case "molotovs":
					type = EquipmentElement.Molotov;
					break;
				case "decoys":
					type = EquipmentElement.Decoy;
					break;
			}
			GeneratePlayerStuffVdm(demo, player, type);
			StartGame();
		}

		private static void GeneratePlayerStuffVdm(Demo demo, PlayerExtended player, EquipmentElement type)
		{
			string vdmFilePath = GetVdmFilePath(demo);
			string generated = string.Empty;
			int actionCount = 0;
			int lastTick = 0;
			int beginTickDelayCount = (int)(demo.ServerTickrate * STUFF_BEGIN_DELAY);
			int endTickDelayCount = (int)(demo.ServerTickrate * STUFF_END_DELAY);
			int lastSuffSartedTick = 0;
			// max delay between 2 stuffs
			int maxTickDelayCount = (int)(demo.ServerTickrate * MAX_ACTION_INTERVAL_DELAY);
			int nextActionDelayCount = (int)(demo.ServerTickrate * NEXT_ACTION_DELAY);
			string message = GetFastForwardMessage(type);

			foreach (WeaponFire e in demo.WeaponFired)
			{
				// TODO rework weapon type detection and remove strong dependency with demoinfo
				if (e.ShooterSteamId == player.SteamId && e.Weapon.Element == type
					|| (e.ShooterSteamId == player.SteamId
					&& type == EquipmentElement.Molotov
					&& (e.Weapon.Element == EquipmentElement.Molotov
					|| e.Weapon.Element == EquipmentElement.Incendiary)))
				{
					int startToTick = actionCount == 0 ? 0 : lastTick;
					int skipToTick = 0;
					switch (type)
					{
						case EquipmentElement.Smoke:
							// check if the player thrown an other smoke just after the previous one
							if (e.Tick - lastTick > maxTickDelayCount)
							{
								skipToTick = e.Tick - beginTickDelayCount;
								// if a smoke has been thrown previously, we skip ahead just after its popped
								if (lastSuffSartedTick != 0) startToTick = lastSuffSartedTick + endTickDelayCount;
								generated += string.Format(Properties.Resources.text_message_start, ++actionCount, startToTick - nextActionDelayCount, message);
								generated += string.Format(Properties.Resources.screen_fade_start, ++actionCount, startToTick - nextActionDelayCount);
								generated += string.Format(Properties.Resources.skip_ahead, ++actionCount, startToTick, skipToTick);
								generated += string.Format(Properties.Resources.spec_player, ++actionCount, startToTick, e.ShooterEntityId);
								
							}

							// find the tick where the smoke popped
							foreach (Round round in demo.Rounds.Where(round => round.Number == e.RoundNumber))
							{
								foreach (
									SmokeNadeStartedEvent smokeNadeStartedEvent in
										round.SmokeStarted.Where(
											smokeNadeStartedEvent =>
												smokeNadeStartedEvent.ThrowerSteamId == player.SteamId
												&& smokeNadeStartedEvent.Tick > lastSuffSartedTick))
								{
									lastSuffSartedTick = smokeNadeStartedEvent.Tick;
									break;
								}
							}
							break;
						case EquipmentElement.Molotov:
							if (e.Tick - lastTick > maxTickDelayCount)
							{
								skipToTick = e.Tick - beginTickDelayCount;
								if (lastSuffSartedTick != 0) startToTick = lastSuffSartedTick + endTickDelayCount;
								generated += string.Format(Properties.Resources.text_message_start, ++actionCount, startToTick - nextActionDelayCount, message);
								generated += string.Format(Properties.Resources.screen_fade_start, ++actionCount, startToTick - nextActionDelayCount);
								generated += string.Format(Properties.Resources.skip_ahead, ++actionCount, startToTick, skipToTick);
								generated += string.Format(Properties.Resources.spec_player, ++actionCount, startToTick, e.ShooterEntityId);
								// the molotov may have not burned, use time average instead
								lastSuffSartedTick = e.Tick + (int)(demo.ServerTickrate * MOLOTOV_TIME);
							}
							break;
						case EquipmentElement.Flash:
						case EquipmentElement.Decoy:
						case EquipmentElement.HE:
							if (e.Tick - lastTick > maxTickDelayCount)
							{
								skipToTick = e.Tick - beginTickDelayCount;
								if (lastSuffSartedTick != 0) startToTick = lastSuffSartedTick + endTickDelayCount;
								generated += string.Format(Properties.Resources.text_message_start, ++actionCount, startToTick - nextActionDelayCount, message);
								generated += string.Format(Properties.Resources.screen_fade_start, ++actionCount, startToTick - nextActionDelayCount);
								generated += string.Format(Properties.Resources.skip_ahead, ++actionCount, startToTick, skipToTick);
								generated += string.Format(Properties.Resources.spec_player, ++actionCount, startToTick, e.ShooterEntityId);
							}

							switch (type)
							{
								case EquipmentElement.Flash:
									foreach (Round round in demo.Rounds.Where(round => round.Number == e.RoundNumber))
									{
										foreach (
											FlashbangExplodedEvent flashEvent in
												round.FlashbangsExploded.Where(
													flashExplodedEvent =>
														flashExplodedEvent.ThrowerSteamId == player.SteamId
														&& flashExplodedEvent.Tick > lastSuffSartedTick))
										{
											lastSuffSartedTick = flashEvent.Tick;
											break;
										}
									}
									break;
								case EquipmentElement.Decoy:
									foreach (DecoyStartedEvent decoyEvent in demo.DecoyStarted)
									{
										if (decoyEvent.ThrowerSteamId == player.SteamId
											&& decoyEvent.RoundNumber == e.RoundNumber
											&& decoyEvent.Tick > lastSuffSartedTick)
										{
											lastSuffSartedTick = decoyEvent.Tick;
											break;
										}
									}
									break;
								case EquipmentElement.HE:
									foreach (Round round in demo.Rounds.Where(round => round.Number == e.RoundNumber))
									{
										foreach (
											ExplosiveNadeExplodedEvent heEvent in
												round.ExplosiveGrenadesExploded.Where(
													heExplodedEvent =>
														heExplodedEvent.ThrowerSteamId == player.SteamId
														&& heExplodedEvent.Tick > lastSuffSartedTick))
										{
											lastSuffSartedTick = heEvent.Tick;
											break;
										}
									}
									break;
							}
							break;
					}

					lastTick = e.Tick;
				}
			}

			generated += string.Format(Properties.Resources.stop_playback, ++actionCount, lastTick + nextActionDelayCount);
			string content = string.Format(Properties.Resources.main, generated);
			File.WriteAllText(vdmFilePath, content);
		}

		private static void GenerateSpecPlayerVdm(Demo demo, int tick, int playerEntityId)
		{
			string vdmFilePath = GetVdmFilePath(demo);
			string generated = string.Format(Properties.Resources.spec_player, 0, tick, playerEntityId);
			string content = string.Format(Properties.Resources.main, generated);
			File.WriteAllText(vdmFilePath, content);
		}

		private static void GenerateHighLowVdm(Demo demo, bool isHighlight, string steamId = null)
		{
			int lastTick = 0;
			int actionCount = 0;
			string generated = string.Empty;
			int currentRoundNumber = 0;
			int tickDelayCount = (int)(demo.ServerTickrate * MAX_ACTION_INTERVAL_DELAY);
			int nextActionDelayCount = (int)(demo.ServerTickrate * NEXT_ACTION_DELAY);
			string message = "Fast forwarding to the next kill...";

			foreach (KillEvent e in demo.Kills)
			{
				if ((!isHighlight && (e.KilledSteamId == Properties.Settings.Default.WatchAccountSteamId
					|| (steamId != null && e.KilledSteamId.ToString() == steamId)))
					|| (isHighlight && (e.KillerSteamId == Properties.Settings.Default.WatchAccountSteamId
					|| (steamId != null && e.KillerSteamId.ToString() == steamId))))
				{
					int startTick = actionCount == 0 ? 0 : lastTick;
					// check if the player had others kills during the current round
					if (isHighlight && currentRoundNumber == e.RoundNumber)
					{
						// fast forward if the next kill is far away
						if (lastTick - e.Tick > tickDelayCount)
						{
							generated += string.Format(Properties.Resources.text_message_start, ++actionCount, e.Tick, message);
							generated += string.Format(Properties.Resources.screen_fade_start, ++actionCount, e.Tick);
							generated += string.Format(Properties.Resources.skip_ahead, ++actionCount, startTick, e.Tick - tickDelayCount);
						}
						generated += string.Format(Properties.Resources.spec_player, ++actionCount, startTick + SWITCH_PLAYER_TICK_DELAY, e.KilledEntityId);
						lastTick = e.Tick;
						continue;
					}

					currentRoundNumber = e.RoundNumber;
					generated += string.Format(Properties.Resources.text_message_start, ++actionCount, startTick < nextActionDelayCount ? 0 : startTick, message);
					generated += string.Format(Properties.Resources.screen_fade_start, ++actionCount, startTick < nextActionDelayCount ? 0 : startTick);
					generated += string.Format(Properties.Resources.skip_ahead, ++actionCount, startTick < nextActionDelayCount ? 0 : startTick + nextActionDelayCount, e.Tick - tickDelayCount);
					generated += string.Format(Properties.Resources.spec_player, ++actionCount, startTick < nextActionDelayCount ? 0 : startTick + nextActionDelayCount, e.KilledEntityId);
					lastTick = e.Tick;
				}
			}

			generated += string.Format(Properties.Resources.stop_playback, ++actionCount, lastTick + nextActionDelayCount);
			string content = string.Format(Properties.Resources.main, generated);
			string vdmFilePath = GetVdmFilePath(demo);
			File.WriteAllText(vdmFilePath, content);
		}

		private static string GetFastForwardMessage(EquipmentElement type)
		{
			switch (type)
			{
				case EquipmentElement.Smoke:
					return "Fast forwarding to the next smoke...";
				case EquipmentElement.Flash:
					return "Fast forwarding to the next flashbang...";
				case EquipmentElement.HE:
					return "Fast forwarding to the next he...";
				case EquipmentElement.Molotov:
				case EquipmentElement.Incendiary:
					return "Fast forwarding to the next molotov...";
				case EquipmentElement.Decoy:
					return "Fast forwarding to the next decoy...";
				default:
					return string.Empty;
			}
		}

		private static string GetVdmFilePath(Demo demo)
		{
			return demo.Path.Substring(0, demo.Path.Length - 3) + "vdm";
		}
	}
}
