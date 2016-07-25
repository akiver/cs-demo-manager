using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using Core.Models;
using Microsoft.Win32;

namespace Core
{
	public static class AppSettings
	{
		public static string AUTHOR = "AkiVer";
		public static string APP_NAME = "CSGO Demos Manager";
		public static string APP_WEBSITE = "http://csgo-demos-manager.com";
		public static Version APP_VERSION = new Version("2.8.1");
		private const string MATCH_LIST_FILENAME = "matches.dat";
		public const string PROCESS_NAME = "CSGODemosManager";
		public const string BOT_PROCESS_NAME = "CSGOSuspectsBot";
		public const string RESOURCES_URI = "pack://application:,,,/csgodm.resources;component/";
		public const string CORE_URI = "pack://application:,,,/csgodm.core;component/";
		// Dummy file name created from the installer to clear data cache at the 1st start of the app
		public const string DUMMY_CACHE_FILENAME = "cache";

		/// <summary>
		/// Return the Steam exe path from the registry
		/// </summary>
		/// <returns></returns>
		public static string SteamExePath()
		{
			return (string)Registry.GetValue(@"HKEY_CURRENT_USER\SOFTWARE\Valve\Steam", "SteamExe", null);
		}

		/// <summary>
		/// Return the Steam path
		/// </summary>
		/// <returns></returns>
		public static string SteamPath()
		{
			return (string)Registry.GetValue(@"HKEY_CURRENT_USER\SOFTWARE\Valve\Steam", "SteamPath", null);
		}

		/// <summary>
		/// Return the CSGO path (csgo folder)
		/// </summary>
		/// <returns></returns>
		public static string GetCsgoPath()
		{
			string steamPath = SteamPath();
			if (steamPath == null) return null;
			return steamPath + "/SteamApps/common/Counter-Strike Global Offensive/csgo";
		}

		/// <summary>
		/// Return the path where JSON files (contains demos data) are stored
		/// </summary>
		/// <returns></returns>
		public static string GetFolderCachePath()
		{
			string windowsAppDataFolder = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
			string appDataFolder = Path.Combine(windowsAppDataFolder, AUTHOR);
			appDataFolder = Path.Combine(appDataFolder, APP_NAME);

			if (!Directory.Exists(appDataFolder))
			{
				Directory.CreateDirectory(appDataFolder);
			}

			return appDataFolder;
		}

		/// <summary>
		/// Check if the user has access to the awesome world of the Internet
		/// </summary>
		/// <returns></returns>
		[DllImport("wininet.dll")]
		private static extern bool InternetGetConnectedState(out int description, int reservedValue);

		public static bool IsInternetConnectionAvailable()
		{
			int description;
			return InternetGetConnectedState(out description, 0);
		}

		public static bool IsRunning()
		{
			return Process.GetProcessesByName(PROCESS_NAME).Length > 0;
		}

		public static bool IsBotRunning()
		{
			return Process.GetProcessesByName(BOT_PROCESS_NAME).Length > 0;
		}

		/// <summary>
		/// Return the file location that boiler.exe has created
		/// </summary>
		/// <returns></returns>
		public static string GetMatchListDataFilePath()
		{
			return GetFolderCachePath() + Path.DirectorySeparatorChar + MATCH_LIST_FILENAME;
		}

		public static List<DemoStatus> DefaultStatus = new List<DemoStatus>
		{
			new DemoStatus
			{
				Name = "none",
				Label = "None"
			},
			new DemoStatus
			{
				Name = "watched",
				Label = "Watched"
			},
			new DemoStatus
			{
				Name = "towatch",
				Label = "To watch"
			}
		};

		public static List<Rank> RankList = new List<Rank>
		{
			new Rank
			{
				Number = 0,
				Name = "None",
				Logo = CORE_URI + "Resources/Images/ranks/no_rank.png"
			},
			new Rank
			{
				Number = 1,
				Name = "Silver I",
				Logo = CORE_URI + "Resources/Images/ranks/elo01.png"
			},
			new Rank
			{
				Number = 2,
				Name = "Silver II",
				Logo = CORE_URI + "Resources/Images/ranks/elo02.png"
			},
			new Rank
			{
				Number = 3,
				Name = "Silver III",
				Logo = CORE_URI + "Resources/Images/ranks/elo03.png"
			},
			new Rank
			{
				Number = 4,
				Name = "Silver IV",
				Logo = CORE_URI + "Resources/Images/ranks/elo04.png"
			},
			new Rank
			{
				Number = 5,
				Name = "Silver Elite",
				Logo = CORE_URI + "Resources/Images/ranks/elo05.png"
			},
			new Rank
			{
				Number = 6,
				Name = "Silver Elite Master",
				Logo = CORE_URI + "Resources/Images/ranks/elo06.png"
			},
			new Rank
			{
				Number = 7,
				Name = "Gold Nova I",
				Logo = CORE_URI + "Resources/Images/ranks/elo07.png"
			},
			new Rank
			{
				Number = 8,
				Name = "Gold Nova II",
				Logo = CORE_URI + "Resources/Images/ranks/elo8.png"
			},
			new Rank
			{
				Number = 9,
				Name = "Gold Nova III",
				Logo = CORE_URI + "Resources/Images/ranks/elo09.png"
			},
			new Rank
			{
				Number = 10,
				Name = "Gold Nova Master",
				Logo = CORE_URI + "Resources/Images/ranks/elo10.png"
			},
			new Rank
			{
				Number = 11,
				Name = "Master Guardian I",
				Logo = CORE_URI + "Resources/Images/ranks/elo11.png"
			},
			new Rank
			{
				Number = 12,
				Name = "Master Guardian II",
				Logo = CORE_URI + "Resources/Images/ranks/elo12.png"
			},
			new Rank
			{
				Number = 13,
				Name = "Master Guardian Elite",
				Logo = CORE_URI + "Resources/Images/ranks/elo13.png"
			},
			new Rank
			{
				Number = 14,
				Name = "Distinguished Master Guardian",
				Logo = CORE_URI + "Resources/Images/ranks/elo14.png"
			},
			new Rank
			{
				Number = 15,
				Name = "Legendary Eagle",
				Logo = CORE_URI + "Resources/Images/ranks/elo15.png"
			},
			new Rank
			{
				Number = 16,
				Name = "Legendary Eagle Master",
				Logo = CORE_URI + "Resources/Images/ranks/elo16.png"
			},
			new Rank
			{
				Number = 17,
				Name = "Supreme Master First Class",
				Logo = CORE_URI + "Resources/Images/ranks/elo17.png"
			},
			new Rank
			{
				Number = 18,
				Name = "Global Elite",
				Logo = CORE_URI + "Resources/Images/ranks/elo18.png"
			}
		};
	}
}
