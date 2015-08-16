using CSGO_Demos_Manager.Models;
using System.Collections.Generic;
using System.Diagnostics;

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
			Process[] currentProcess = Process.GetProcessesByName("csgo");
			if (currentProcess.Length > 0)
			{
				currentProcess[0].Kill();
			}

			string args = string.Join(ARGUMENT_SEPARATOR, _arguments.ToArray());
			_process.StartInfo.Arguments = args;
			_process.Start();
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
			_arguments.Add(steamId ?? Properties.Settings.Default.SteamID.ToString());
			StartGame();
		}

		internal void WatchLowlightDemo(Demo demo, string steamId = null)
		{
			_arguments.Add("+playdemo");
			_arguments.Add(demo.Path);
			_arguments.Add(steamId ?? Properties.Settings.Default.SteamID.ToString());
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
