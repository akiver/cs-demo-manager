using CSGO_Demos_Manager.Models;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using CSGO_Demos_Manager.Exceptions.Launcher;

namespace CSGO_Demos_Manager.Services
{
	public class GameLauncher
	{
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

		internal void WatchHighlightDemo(Demo demo, string steamId = null)
		{
			_arguments.Add("+playdemo");
			_arguments.Add(demo.Path);
			_arguments.Add(steamId ?? Properties.Settings.Default.WatchAccountSteamId.ToString());
			StartGame();
		}

		internal void WatchLowlightDemo(Demo demo, string steamId = null)
		{
			_arguments.Add("+playdemo");
			_arguments.Add(demo.Path);
			_arguments.Add(steamId ?? Properties.Settings.Default.WatchAccountSteamId.ToString());
			_arguments.Add("lowlights");
			StartGame();
		}

		internal void WatchDemoAt(Demo demo, int tick)
		{
			_arguments.Add("+playdemo");
			_arguments.Add(demo.Path + "@" + tick);
			StartGame();
		}
	}
}
