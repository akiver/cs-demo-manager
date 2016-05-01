using CSGO_Demos_Manager.Models;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using CSGO_Demos_Manager.Exceptions.Launcher;
using CSGO_Demos_Manager.Models.Events;

namespace CSGO_Demos_Manager.Services
{
	public class GameLauncher
	{
		private const double ACTION_DELAY = 15.625;
		private const int TICK_KILL_DELAY = 128;
		private const int SWITCH_PLAYER_TICK_DELAY = 10;
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

		internal void WatchHighlightDemo(Demo demo, bool fromPlayerPerspective, string steamId = null)
		{
			_arguments.Add("+playdemo");
			_arguments.Add(demo.Path);
			if (fromPlayerPerspective)
			{
				_arguments.Add(steamId ?? Properties.Settings.Default.WatchAccountSteamId.ToString());
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
			}
			StartGame();
		}

		internal void WatchDemoAt(Demo demo, int tick, bool delay = false, int playerEntityId = -1)
		{
			_arguments.Add("+playdemo");
			int tickDelayCount = (int)(demo.ServerTickrate * ACTION_DELAY);
			if (delay && tick > tickDelayCount) tick -= tickDelayCount;
			_arguments.Add(demo.Path + "@" + tick);
			if (playerEntityId != -1) GenerateSpecPlayerVdm(demo, tick, playerEntityId);
			StartGame();
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
			int tickDelayCount = (int)(demo.ServerTickrate * ACTION_DELAY);

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
							generated += string.Format(Properties.Resources.text_message_start, ++actionCount, e.Tick, "Fast-Forwarding to next kill...");
							generated += string.Format(Properties.Resources.screen_fade_start, ++actionCount, e.Tick);
							generated += string.Format(Properties.Resources.skip_ahead, ++actionCount, startTick, e.Tick - tickDelayCount);
						}
						generated += string.Format(Properties.Resources.spec_player, ++actionCount, startTick + SWITCH_PLAYER_TICK_DELAY, e.KilledEntityId);
						lastTick = e.Tick;
						continue;
					}

					currentRoundNumber = e.RoundNumber;
					generated += string.Format(Properties.Resources.text_message_start, ++actionCount, startTick < TICK_KILL_DELAY ? 0 : startTick, "Fast-Forwarding to next kill...");
					generated += string.Format(Properties.Resources.screen_fade_start, ++actionCount, startTick < TICK_KILL_DELAY ? 0 : startTick);
					generated += string.Format(Properties.Resources.skip_ahead, ++actionCount, startTick + TICK_KILL_DELAY, e.Tick - tickDelayCount);
					generated += string.Format(Properties.Resources.spec_player, ++actionCount, startTick < TICK_KILL_DELAY ? 0 : startTick + TICK_KILL_DELAY, e.KilledEntityId);
					lastTick = e.Tick;
				}
			}

			generated += string.Format(Properties.Resources.stop_playback, ++actionCount, lastTick + TICK_KILL_DELAY);
			string content = string.Format(Properties.Resources.main, generated);
			string vdmFilePath = GetVdmFilePath(demo);
			File.WriteAllText(vdmFilePath, content);
		}

		private static string GetVdmFilePath(Demo demo)
		{
			return demo.Path.Remove(demo.Path.Length - 3) + "vdm";
		}
	}
}
