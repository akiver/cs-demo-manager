using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows;
using Core;
using GalaSoft.MvvmLight.Threading;
using MahApps.Metro;
using Manager.Properties;

namespace Manager
{
	public partial class App : IDisposable
	{
		private Mutex _instance;
		public static string StartUpWindow { get; set; } = "demos";
		public static string DemoFilePath { get; set; }

		public App()
		{
			DispatcherHelper.Initialize();
#if RELEASE
			AppDomain.CurrentDomain.UnhandledException += HandleAppDomainUnhandleException;
#endif
		}

		private static void HandleAppDomainUnhandleException(object sender, UnhandledExceptionEventArgs args)
		{
			Exception e = (Exception)args.ExceptionObject;
			Logger.Instance.Log(e);
			MessageBox.Show("An unexpected error occured. Please send the 'errors.log' file accessible from settings." + Environment.NewLine
				+ "Message Error : " + Environment.NewLine + e.Message, "Error");
		}

		private void Application_Startup(object sender, StartupEventArgs e)
		{
			bool createdNew;
			Assembly assembly = Assembly.GetExecutingAssembly();
			GuidAttribute attribute = (GuidAttribute)assembly.GetCustomAttributes(typeof(GuidAttribute), true)[0];
			string appGuid = attribute.Value;
			_instance = new Mutex(true, @"Global\" + appGuid, out createdNew);
			if (!createdNew)
			{
				// Send a message if it's a .dem provided as argument
				if (e.Args.Length > 0 && e.Args[0].EndsWith(".dem"))
				{
					// send a message to display the demo's details
					Process[] processes = Process.GetProcessesByName(AppSettings.PROCESS_NAME);
					foreach (Process process in processes)
					{
						Win32Utils.SendWindowStringMessage(process.MainWindowHandle, Win32Utils.WM_LOAD_DEMO, 0, e.Args[0]);
						Win32Utils.SetForegroundWindow(process.MainWindowHandle);
					}
				}
				// shutdown as there is already an instance
				_instance = null;
				Current.Shutdown();
				return;
			}

			// upgrade user settings
			if (Settings.Default.UpgradeRequired)
			{
				Settings.Default.Upgrade();
				Settings.Default.UpgradeRequired = false;
				Settings.Default.Save();
			}

			if (Settings.Default.StartBotOnLaunch)
			{
				if (File.Exists(AppSettings.BOT_PROCESS_NAME + ".exe")
					&& !AppSettings.IsBotRunning())
				{
					Process.Start(AppSettings.BOT_PROCESS_NAME);
				}
			}

			for (int i = 0; i != e.Args.Length; ++i)
			{
				// Start the app on Suspects view
				if (e.Args[i] == "/suspects")
				{
					StartUpWindow = "suspects";
				}
				// this case is when no app instance exists and a .dem is provided as argument
				if (e.Args[i].EndsWith(".dem") && File.Exists(e.Args[i]))
				{
					// change the default startup window and set the demo path to display
					StartUpWindow = "demo";
					DemoFilePath = e.Args[0];
				}
			}

			Settings.Default.DateStatsTo = DateTime.Today;
			if (Settings.Default.DownloadFolder == string.Empty && AppSettings.GetCsgoPath() != null)
			{
				string demoFolder = AppSettings.GetCsgoPath() + Path.DirectorySeparatorChar + "replays";
				if (Directory.Exists(demoFolder))
				{
					Settings.Default.DownloadFolder = Path.GetFullPath(demoFolder);
				}
			}
			Settings.Default.Save();
		}

		private void Application_Exit(object sender, ExitEventArgs e)
		{
			if (Settings.Default.CloseBotOnExit && _instance != null)
			{
				Win32Utils.SendMessageToBot(Win32Utils.WM_CLOSE);
			}
			else
			{
				Win32Utils.SendMessageToBot(Win32Utils.WM_CSGO_DM_CLOSED);
			}
		}

		protected override void OnStartup(StartupEventArgs e)
		{
			ThemeManager.AddAccent("CustomLime", new Uri("pack://application:,,,/CSGODemosManager;component/Resources/Accents/CustomLime.xaml"));
			ThemeManager.AddAppTheme("Dark", new Uri("pack://application:,,,/CSGODemosManager;component/Resources/Accents/ThemeDark.xaml"));
			ThemeManager.AddAppTheme("Light", new Uri("pack://application:,,,/CSGODemosManager;component/Resources/Accents/ThemeLight.xaml"));
			Accent accent = ThemeManager.GetAccent("CustomLime");
			AppTheme theme = ThemeManager.GetAppTheme(Settings.Default.Theme);
			ThemeManager.ChangeAppStyle(Current, accent, theme);
			base.OnStartup(e);
		}

		protected override void OnExit(ExitEventArgs e)
		{
			_instance?.ReleaseMutex();
			base.OnExit(e);
		}

		public void Dispose()
		{
			_instance.Dispose();
		}
	}
}
