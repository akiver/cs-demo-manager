using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Core;
using Core.Models;
using Core.Models.Events;
using DemoInfo;
using Services.Exceptions.Launcher;
using Services.Models;
using Player = Core.Models.Player;

namespace Services.Concrete
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
        private const string ARGUMENT_SEPARATOR = " ";
		/// <summary>
		/// Launcher configuration
		/// </summary>
		private readonly GameLauncherConfiguration _config;
		private readonly List<string> _arguments = new List<string>{"-applaunch 730", "-novid"};
		private readonly Process _process = new Process();
		private readonly List<string> _hlaeArguments = new List<string>
		{
			"hlae.exe",
			"-noGui",
			"-csgoLauncher",
			"-autoStart",
		};

		public GameLauncher(GameLauncherConfiguration config)
		{
			_config = config;
			_arguments.Add("+playdemo");
			_arguments.Add(_config.Demo.Path);
		}

		public async Task StartGame()
		{
			SetupResolutionParameters();
			SetupWorldwideParameter();
			KillCsgo();
			if (_config.EnableHlae)
			{
				// start the game using HLAE
				if (!File.Exists(_config.CsgoExePath))
					throw new CsgoNotFoundException();

				if (!File.Exists(_config.HlaeExePath))
					throw new HlaeNotFound();

				_arguments.Add(_config.LaunchParameters);
				List<string> argList = new List<string>(_hlaeArguments)
				{
					$"-csgoExe \"{_config.CsgoExePath}\"",
					$"-customLaunchOptions \"{string.Join(ARGUMENT_SEPARATOR, _arguments.ToArray())}\""
				};

				if (_config.EnableHlaeConfigParent && Directory.Exists(_config.HlaeConfigParentFolderPath))
				{
					argList.Add("-mmcfgEnabled true");
					argList.Add($"-mmcfg \"{_config.HlaeConfigParentFolderPath}\"");
				}

				string args = string.Join(ARGUMENT_SEPARATOR, argList.ToArray());
				ProcessStartInfo psi = new ProcessStartInfo
				{
					Arguments = args,
					FileName = _config.HlaeExePath,
					UseShellExecute = false,
				};
				_process.StartInfo = psi;
				_process.Start();
				_config.OnHLAEStarted?.Invoke();
				// wait for HLAE process to exit
				await _process.WaitForExitAsync();
				_config.OnHLAEClosed?.Invoke();
			}
			else
			{
				string args = string.Join(ARGUMENT_SEPARATOR, _arguments.ToArray());
				ProcessStartInfo psi = new ProcessStartInfo
				{
					Arguments = args + " " + _config.LaunchParameters,
					FileName = _config.SteamExePath,
				};
				_process.StartInfo = psi;
				_process.Start();
			}

			if (_config.DeleteVdmFileAtStratup)
				await DeleteVdmFile();

			_config.OnGameStarted?.Invoke();

			Process csgoProcess = await WaitForCsgoProcess();
			if (csgoProcess  != null)
			{
				_config.OnGameRunning?.Invoke();
				await csgoProcess.WaitForExitAsync();
			}

			if (_config.OnGameClosed != null)
				await _config.OnGameClosed();

			if (_config.DeleteVdmFileWhenClosed)
				await DeleteVdmFile();
		}

		private async Task<Process> WaitForCsgoProcess()
		{
			Process process = null;
			int attemptCount = 0;
			await Task.Run(async () => {
				for (; ; )
				{
					await Task.Delay(3000);
					Process[] processes = Process.GetProcessesByName(AppSettings.CSGO_PROCESS_NAME);
					if (processes.Length > 0)
					{
						process = processes[0];
						break;
					}
					if (attemptCount == 6)
					{
						break;
					}

					attemptCount++;
				}
			});

			return process;
		}

		private void SetupResolutionParameters()
		{
			_arguments.Add("-w");
			_arguments.Add(_config.Width > 800 ? _config.Width.ToString() : "800");
			_arguments.Add("-h");
			_arguments.Add(_config.Height > 600 ? _config.Height.ToString() : "600");
			_arguments.Add(_config.Fullscreen ? "-fullscreen" : "-windowed");
		}

		private void SetupWorldwideParameter()
		{
			if (_config.IsWorldwideEnabled)
				_arguments.Add("-worldwide");
		}

		private Task DeleteVdmFile()
		{
			return Task.Run(() =>
			{
				string vdmPath = _config.Demo.GetVdmFilePath();
				if (File.Exists(vdmPath)) File.Delete(vdmPath);
			});
		}

		public async void WatchHighlightDemo(bool fromPlayerPerspective)
		{
			if (_config.UseCustomActionsGeneration)
			{
				GenerateHighLowVdm(true, fromPlayerPerspective);
				_config.DeleteVdmFileAtStratup = false;
			}
			else
			{
				if (fromPlayerPerspective)
				{
					_arguments.Add(_config.FocusPlayerSteamId.ToString());
				}
				else
				{
					GenerateHighLowVdm(true, false);
					_config.DeleteVdmFileAtStratup = false;
				}
			}
			await StartGame();
		}

		public async void WatchLowlightDemo(bool fromPlayerPerspective)
		{
			if (_config.UseCustomActionsGeneration)
			{
				GenerateHighLowVdm(false, fromPlayerPerspective);
				_config.DeleteVdmFileAtStratup = false;
			}
			else
			{
				if (fromPlayerPerspective)
				{
					GenerateHighLowVdm(false);
					_config.DeleteVdmFileAtStratup = false;
				}
				else
				{
					_arguments.Add(_config.FocusPlayerSteamId.ToString());
					_arguments.Add("lowlights");
				}
			}
			await StartGame();
		}

		public async void WatchDemoAt(int tick, bool delay = false)
		{
			if (delay)
			{
				int tickDelayCount = (int)(_config.Demo.ServerTickrate * PLAYBACK_DELAY);
				if (tick > tickDelayCount) tick -= tickDelayCount;
			}
			string generated = string.Empty;
			generated += string.Format(Properties.Resources.skip_ahead, 1, 1, tick);
			if (_config.FocusPlayerSteamId > 0) generated += string.Format(Properties.Resources.spec_player, 2, tick + 1, _config.FocusPlayerSteamId);
			string content = string.Format(Properties.Resources.main, generated);
			File.WriteAllText(_config.Demo.GetVdmFilePath(), content);
			_config.DeleteVdmFileAtStratup = false;
			await StartGame();
		}

		public async void WatchPlayerStuff(Player player, string selectedType)
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
			_config.DeleteVdmFileAtStratup = false;
			await StartGame();
		}

		public async void WatchPlayer()
		{
			GenerateWatchPlayerVdm();
			_config.DeleteVdmFileAtStratup = false;
			await StartGame();
		}

		private void GeneratePlayerStuffVdm(Player player, EquipmentElement type)
		{
			Demo demo = _config.Demo;
			string generated = string.Empty;
			int actionCount = 0;
			int lastTick = 0;
			int beginTickDelayCount = (int)(demo.ServerTickrate * STUFF_BEGIN_DELAY);
			int endTickDelayCount = (int)(demo.ServerTickrate * STUFF_END_DELAY);
			int lastSuffSartedTick = 0;
			// max delay between 2 stuffs
			int maxTickDelayCount = (int)(demo.ServerTickrate * MAX_NEXT_STUFF_DELAY);
			int nextActionDelayCount = (int)(demo.ServerTickrate * NEXT_ACTION_DELAY);
			string message = GetFastForwardMessage(type);

			foreach (WeaponFireEvent e in demo.WeaponFired)
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
								generated += string.Format(Properties.Resources.spec_player, ++actionCount, startToTick, e.ShooterSteamId);
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
								generated += string.Format(Properties.Resources.spec_player, ++actionCount, startToTick, e.ShooterSteamId);
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
			File.WriteAllText(demo.GetVdmFilePath(), content);
		}

		private void GenerateHighLowVdm(bool isHighlight, bool isFromPlayerPerspective = true)
		{
			if (_config.FocusPlayerSteamId <= 0)
				throw new Exception("SteamID required to generate highlights / lowlights.");
			Demo demo = _config.Demo;
			int lastTick = 0;
			int actionCount = 0;
			string generated = string.Empty;
			int currentRoundNumber = 0;
			int tickDelayCount = isHighlight ? (int)(demo.ServerTickrate * HIGHLIGHT_DELAY) : (int)(demo.ServerTickrate * LOWLIGHT_DELAY);
			int maxTickCountNextKill = isHighlight ? (int)(demo.ServerTickrate * HIGHLIGHT_MAX_NEXT_KILL_DELAY) : (int)(demo.ServerTickrate * LOWLIGHT_MAX_NEXT_KILL_DELAY);
			int nextActionDelayCount = (int)(demo.ServerTickrate * NEXT_ACTION_DELAY);
			string message = "Fast forwarding to the next kill...";

			foreach (KillEvent e in demo.Kills)
			{
				if (!isHighlight && e.KilledSteamId == _config.FocusPlayerSteamId
					|| isHighlight && e.KillerSteamId == _config.FocusPlayerSteamId)
				{
					int startTick = actionCount == 0 ? 0 : lastTick;
					// check if the player had others kills during the current round
					if (isHighlight && currentRoundNumber == e.RoundNumber)
					{
						startTick = startTick + (int)(demo.ServerTickrate * SWITCH_PLAYER_DELAY);
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
			File.WriteAllText(demo.GetVdmFilePath(), content);
		}

		private void GenerateWatchPlayerVdm()
		{
			if (_config.FocusPlayerSteamId <= 0)
				throw new Exception("SteamID required to generate player review.");

			Demo demo = _config.Demo;
			int nextTick = 0;
			int startTick = 0;
			int actionCount = 0;
			string generated = string.Empty;
			int nextActionDelayCount = (int)(demo.ServerTickrate * NEXT_ACTION_DELAY);

			var playerDeaths = demo.Kills.Where(k => k.KilledSteamId == _config.FocusPlayerSteamId);

			nextTick = demo.Rounds[0].FreezetimeEndTick;
			generated += string.Format(Properties.Resources.skip_ahead, ++actionCount, 0, nextTick);
			generated += string.Format(Properties.Resources.spec_player, ++actionCount, nextTick + 1, _config.FocusPlayerSteamId);

			foreach (Round r in demo.Rounds)
			{
                // last round, don't do anything just let the demo play out
                if (r.Number == demo.Rounds.Count)
                    break;
                
                // player dies this round, skip to next round after player death
                if (playerDeaths.Any(k => k.RoundNumber == r.Number))
				{
					startTick = playerDeaths.Where(k => k.RoundNumber == r.Number).First().Tick + nextActionDelayCount;
                    nextTick = demo.Rounds[r.Number].FreezetimeEndTick;
                }
				// player doesn't die this round, show full round
				else
				{
					startTick = r.EndTickOfficially;
                    nextTick = demo.Rounds[r.Number].FreezetimeEndTick;
                }

				// skips the freezetime at the beginning of the round
				generated += string.Format(Properties.Resources.skip_ahead, ++actionCount, startTick, nextTick);
			}

			string content = string.Format(Properties.Resources.main, generated);
			File.WriteAllText(demo.GetVdmFilePath(), content);
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

		private static void KillCsgo()
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
