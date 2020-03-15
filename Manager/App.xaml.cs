using System;
using System.Configuration;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Reflection;
using System.Runtime.ExceptionServices;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Threading;
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
		public static string[] Contributors = {
			"0BuRner",
			"Ezro",
			"green-s",
			"moritzuehling",
			"thedudeguy1",
			"Leonardo",
			"Cookieseller",
			"CorySanin",
		};
		public static string[] Translators = {
			"FisherMan aka. deathles乃夫 / AlexWIT from 無盡國度 / ❤Elsa (Chinese Simplified)",
			"Allan \"Michael\" Simonsen (Danish)",
			"Leonardo / RedDeadLuigi / mvinoba (Brazilian)",
			"Spidersouris (French)",
			"Kacper \"sikl0`\" Olkis (Polish)",
			"yRRCK / FliessendWasser (German)",
			"Paco González López / monxas (Spanish)",
			"aLieN (Hungarian)",
		};

		public App()
		{
			DispatcherHelper.Initialize();
			AppDomain.CurrentDomain.UnhandledException += OnCurrentDomainOnUnhandledException;
			DispatcherUnhandledException += OnDispatcherUnhandledException;
			TaskScheduler.UnobservedTaskException += TaskSchedulerOnUnobservedTaskException;
		}

		private static void OnCurrentDomainOnUnhandledException(object sender, UnhandledExceptionEventArgs e)
		{
			Exception ex = (Exception)e.ExceptionObject;
			Logger.Instance.Log(ex);
			MessageBox.Show(string.Format(Manager.Properties.Resources.UnexpectedErrorOccured, ex.Message), Manager.Properties.Resources.Error);
		}

		private static void TaskSchedulerOnUnobservedTaskException(object sender, UnobservedTaskExceptionEventArgs e)
		{
			Logger.Instance.Log(e.Exception);
		}

        private static void OnDispatcherUnhandledException(object sender, DispatcherUnhandledExceptionEventArgs e)
		{
			Logger.Instance.Log(e.Exception);
		}

		private void Application_Startup(object sender, StartupEventArgs e)
		{
			try
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
				}

				CultureInfo ci = CultureInfo.InstalledUICulture;
				if (string.IsNullOrEmpty(Settings.Default.Language))
				{
					Settings.Default.Language = ci.Name;
				}
				CultureInfo culture = new CultureInfo(Settings.Default.Language);
				CultureInfo.DefaultThreadCurrentCulture = culture;
				CultureInfo.DefaultThreadCurrentUICulture = culture;

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
					// Start demos download
					if (e.Args[i] == "/download")
					{
						StartUpWindow = "download";
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
			}
			catch (Exception ex)
			{
				HandleException(ex);
			}
		}

		private void Application_Exit(object sender, ExitEventArgs e)
		{
			Settings.Default.Save();
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
			try
			{
				ThemeManager.AddAccent("CustomLime", new Uri("pack://application:,,,/CSGODemosManager;component/Resources/Accents/CustomLime.xaml"));
				ThemeManager.AddAppTheme("Dark", new Uri("pack://application:,,,/CSGODemosManager;component/Resources/Accents/ThemeDark.xaml"));
				ThemeManager.AddAppTheme("Light", new Uri("pack://application:,,,/CSGODemosManager;component/Resources/Accents/ThemeLight.xaml"));
				Accent accent = ThemeManager.GetAccent("CustomLime");
				AppTheme theme = ThemeManager.GetAppTheme(Settings.Default.Theme);
				ThemeManager.ChangeAppStyle(Current, accent, theme);
				base.OnStartup(e);
			}
			catch (Exception ex)
			{
				HandleException(ex);
			}
		}

		protected override void OnExit(ExitEventArgs e)
		{
			_instance?.ReleaseMutex();
			base.OnExit(e);
		}

		private static void HandleException(Exception e)
		{
			Logger.Instance.Log(e);
			if (e is ConfigurationErrorsException)
			{
				if (e.InnerException != null)
				{
					MessageBox.Show(Manager.Properties.Resources.DialogConfigurationCorrupted, Manager.Properties.Resources.Error);
					string filename = ((ConfigurationErrorsException)e.InnerException).Filename;
					File.Delete(filename);
					Settings.Default.Reload();
				}
			}
			else
			{
				MessageBox.Show(string.Format(Manager.Properties.Resources.UnexpectedErrorOccured, e.Message), Manager.Properties.Resources.Error);
			}
			Process.GetCurrentProcess().Kill();
		}

		public void Dispose()
		{
			_instance.Dispose();
		}
	}
}
