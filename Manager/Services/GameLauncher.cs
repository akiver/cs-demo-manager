using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using Core;
using Core.Models;
using Core.Models.Events;
using DemoInfo;
using Manager.Exceptions.Launcher;
using Player = Core.Models.Player;

namespace Manager.Services
{
	public class GameLauncher : IDisposable
	{
		private const int PLAYBACK_DELAY = 15; // Seconds before the playback start
		private const int HIGHLIGHT_DELAY = 4; // Seconds before the playback start and focus on a kill for highlights
		private const int HIGHLIGHT_MAX_NEXT_KILL_DELAY = 10; // Max seconds a kill has to occurred to prevent fast forwarding (highlights)
		private const int LOWLIGHT_DELAY = 10; // Seconds before the playback start and focus on a kill for lowlights
		private const int LOWLIGHT_MAX_NEXT_KILL_DELAY = 15; // Max seconds a kill has to occurred to prevent fast forwarding (lowlights)
		private const int MAX_NEXT_STUFF_DELAY = 15; // Max seconds a stuff has to be thrown to prevent fast forwarding
		private const int NEXT_ACTION_DELAY = 2; // Seconds before the playback fast forward to the next kill / action, Fade in / out and messages are displayed during this period
		private const double SWITCH_PLAYER_DELAY = 0.5; // seconds waited before switching to other player on fast forward
		private const int STUFF_BEGIN_DELAY = 5; // Seconds before the playback start playing and focus on the player
		private const int STUFF_END_DELAY = 3; // Seconds before the playback fast forward to the next stuff when the previous one is done
		private const int MOLOTOV_TIME = 8; // Seconds average waiting time for a molotov end
		private readonly List<string> _arguments = new List<string>{"-applaunch 730", "-novid"};
		private readonly Process _process = new Process();
		private readonly List<string> _hlaeArguments = new List<string>
		{
			"hlae.exe",
			"-noGui",
			"-csgoLauncher",
			"-autoStart",
		};
		private const string ARGUMENT_SEPARATOR = " ";
		private readonly Demo _demo;

		public GameLauncher(Demo demo)
		{
			_demo = demo;
			_process.StartInfo.FileName = AppSettings.SteamExePath();
			_arguments.Add("+playdemo");
			_arguments.Add(demo.Path);
		}

		public void StartGame()
		{
			SetupResolutionParameters();
			KillCsgo();
			if (Properties.Settings.Default.EnableHlae)
			{
				// start the game using HLAE
				if (!File.Exists(Properties.Settings.Default.CsgoExePath))
					throw new CsgoNotFoundException();

				string hlaeExePath = HlaeService.GetHlaeExePath();
				if (!File.Exists(hlaeExePath))
					throw new HlaeNotFound();

				_arguments.Add(Properties.Settings.Default.LaunchParameters);
				List<string> argList = new List<string>(_hlaeArguments)
				{
					$"-csgoExe \"{Properties.Settings.Default.CsgoExePath}\"",
					$"-customLaunchOptions \"{string.Join(ARGUMENT_SEPARATOR, _arguments.ToArray())}\""
				};

				string hlaeConfigParentPath = Properties.Settings.Default.HlaeConfigParentFolderPath;
				if (Properties.Settings.Default.EnableHlaeConfigParent && Directory.Exists(hlaeConfigParentPath))
				{
					argList.Add("-mmcfgEnabled true");
					argList.Add($"-mmcfg \"{hlaeConfigParentPath}\"");
				}

				string args = string.Join(ARGUMENT_SEPARATOR, argList.ToArray());
				ProcessStartInfo psi = new ProcessStartInfo
				{
					Arguments = args,
					FileName = hlaeExePath,
					UseShellExecute = false
				};
				Process.Start(psi);
			}
			else
			{
				string args = string.Join(ARGUMENT_SEPARATOR, _arguments.ToArray());
				_process.StartInfo.Arguments = args + " " + Properties.Settings.Default.LaunchParameters;
				_process.Start();
			}
		}

		public void WatchDemo()
		{
			DeleteVdmFile();
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

		private void DeleteVdmFile()
		{
			string vdmPath = _demo.GetVdmFilePath();
			if (File.Exists(vdmPath)) File.Delete(vdmPath);
		}

		internal void WatchHighlightDemo(bool fromPlayerPerspective, string steamId = null)
		{
			if (Properties.Settings.Default.UseCustomActionsGeneration)
			{
				GenerateHighLowVdm(true, fromPlayerPerspective, steamId);
			}
			else
			{
				if (fromPlayerPerspective)
				{
					_arguments.Add(steamId ?? Properties.Settings.Default.WatchAccountSteamId.ToString());
					DeleteVdmFile();
				}
				else
				{
					GenerateHighLowVdm(true, false, steamId);
				}
			}
			StartGame();
		}

		internal void WatchLowlightDemo(bool fromPlayerPerspective, string steamId = null)
		{
			if (Properties.Settings.Default.UseCustomActionsGeneration)
			{
				GenerateHighLowVdm(false, fromPlayerPerspective, steamId);
			}
			else
			{
				if (fromPlayerPerspective)
				{
					GenerateHighLowVdm(false, true, steamId);
				}
				else
				{
					_arguments.Add(steamId ?? Properties.Settings.Default.WatchAccountSteamId.ToString());
					_arguments.Add("lowlights");
					DeleteVdmFile();
				}
			}
			StartGame();
		}

		internal void WatchDemoAt(int tick, bool delay = false, long steamId = -1)
		{
			DeleteVdmFile();
			if (delay)
			{
				int tickDelayCount = (int)(_demo.ServerTickrate * PLAYBACK_DELAY);
				if (tick > tickDelayCount) tick -= tickDelayCount;
			}
			string generated = string.Empty;
			generated += string.Format(Properties.Resources.skip_ahead, 1, 1, tick);
			if (steamId != -1) generated += string.Format(Properties.Resources.spec_player, 2, tick + 1, steamId);
			string content = string.Format(Properties.Resources.main, generated);
			File.WriteAllText(_demo.GetVdmFilePath(), content);
			StartGame();
		}

		internal void WatchPlayerStuff(Player player, string selectedType)
		{
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
			GeneratePlayerStuffVdm(player, type);
			StartGame();
		}

		private void GeneratePlayerStuffVdm(Player player, EquipmentElement type)
		{
			string generated = string.Empty;
			int actionCount = 0;
			int lastTick = 0;
			int beginTickDelayCount = (int)(_demo.ServerTickrate * STUFF_BEGIN_DELAY);
			int endTickDelayCount = (int)(_demo.ServerTickrate * STUFF_END_DELAY);
			int lastSuffSartedTick = 0;
			// max delay between 2 stuffs
			int maxTickDelayCount = (int)(_demo.ServerTickrate * MAX_NEXT_STUFF_DELAY);
			int nextActionDelayCount = (int)(_demo.ServerTickrate * NEXT_ACTION_DELAY);
			string message = GetFastForwardMessage(type);

			foreach (WeaponFireEvent e in _demo.WeaponFired)
			{
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
								generated += string.Format(Properties.Resources.spec_player, ++actionCount, startToTick, e.ShooterSteamId);
								
							}

							// find the tick where the smoke popped
							foreach (Round round in _demo.Rounds.Where(round => round.Number == e.RoundNumber))
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
								generated += string.Format(Properties.Resources.spec_player, ++actionCount, startToTick, e.ShooterSteamId);
								// the molotov may have not burned, use time average instead
								lastSuffSartedTick = e.Tick + (int)(_demo.ServerTickrate * MOLOTOV_TIME);
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
								generated += string.Format(Properties.Resources.spec_player, ++actionCount, startToTick, e.ShooterSteamId);
							}

							switch (type)
							{
								case EquipmentElement.Flash:
									foreach (Round round in _demo.Rounds.Where(round => round.Number == e.RoundNumber))
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
									foreach (DecoyStartedEvent decoyEvent in _demo.DecoyStarted)
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
									foreach (Round round in _demo.Rounds.Where(round => round.Number == e.RoundNumber))
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
			File.WriteAllText(_demo.GetVdmFilePath(), content);
		}

		private void GenerateHighLowVdm(bool isHighlight, bool isFromPlayerPerspective = true, string steamId = null)
		{
			int lastTick = 0;
			int actionCount = 0;
			string generated = string.Empty;
			int currentRoundNumber = 0;
			int tickDelayCount = isHighlight ? (int)(_demo.ServerTickrate * HIGHLIGHT_DELAY) : (int)(_demo.ServerTickrate * LOWLIGHT_DELAY);
			int maxTickCountNextKill = isHighlight ? (int)(_demo.ServerTickrate * HIGHLIGHT_MAX_NEXT_KILL_DELAY) : (int)(_demo.ServerTickrate * LOWLIGHT_MAX_NEXT_KILL_DELAY);
			int nextActionDelayCount = (int)(_demo.ServerTickrate * NEXT_ACTION_DELAY);
			string message = "Fast forwarding to the next kill...";

			foreach (KillEvent e in _demo.Kills)
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
						startTick = startTick + (int)(_demo.ServerTickrate * SWITCH_PLAYER_DELAY);
						// fast forward if the next kill is far away
						if (e.Tick - lastTick > maxTickCountNextKill)
						{
							generated += string.Format(Properties.Resources.text_message_start, ++actionCount, e.Tick, message);
							generated += string.Format(Properties.Resources.screen_fade_start, ++actionCount, e.Tick);
							generated += string.Format(Properties.Resources.skip_ahead, ++actionCount, startTick, e.Tick - tickDelayCount);
						}
						if (isFromPlayerPerspective)
							generated += string.Format(Properties.Resources.spec_player, ++actionCount, startTick, e.KillerSteamId);
						else
							generated += string.Format(Properties.Resources.spec_player, ++actionCount, startTick, e.KilledSteamId);
						lastTick = e.Tick;
						continue;
					}

					currentRoundNumber = e.RoundNumber;
					generated += string.Format(Properties.Resources.text_message_start, ++actionCount, startTick < nextActionDelayCount ? 0 : startTick, message);
					generated += string.Format(Properties.Resources.screen_fade_start, ++actionCount, startTick < nextActionDelayCount ? 0 : startTick);
					generated += string.Format(Properties.Resources.skip_ahead, ++actionCount, startTick < nextActionDelayCount ? 0 : startTick + nextActionDelayCount, e.Tick - tickDelayCount);
					long specSteamId;
					if (isHighlight)
						specSteamId = isFromPlayerPerspective ? e.KillerSteamId : e.KilledSteamId;
					else
						specSteamId = isFromPlayerPerspective ? e.KilledSteamId : e.KillerSteamId;
					generated += string.Format(Properties.Resources.spec_player, ++actionCount, startTick < nextActionDelayCount ? 0 : startTick + nextActionDelayCount, specSteamId);
					lastTick = e.Tick;
				}
			}

			generated += string.Format(Properties.Resources.stop_playback, ++actionCount, lastTick + nextActionDelayCount);
			string content = string.Format(Properties.Resources.main, generated);
			File.WriteAllText(_demo.GetVdmFilePath(), content);
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

		private void KillCsgo()
		{
			Process[] currentProcess = Process.GetProcessesByName("csgo");
			if (currentProcess.Length > 0)
			{
				currentProcess[0].Kill();
			}
		}

		public void Dispose()
		{
			_process.Dispose();
		}
	}
}
