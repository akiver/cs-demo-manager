using Microsoft.Win32;
using System.IO;
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using CSGO_Demos_Manager.Models;

namespace CSGO_Demos_Manager
{
	public static class AppSettings
	{
		public static string AUTHOR = "AkiVer";
		public static string APP_NAME = "CSGO Demos Manager";
		public static string APP_WEBSITE = "http://csgo-demos-manager.com";
		public static Version APP_VERSION = new Version("2.2.0");
		// Don't forget to put your Steam API key into the file "steam_api_key.txt"
		public static string STEAM_API_KEY = Properties.Resources.steam_api_key;
		// when an update needs to clear data cache, set it to true to prompt the user to save his comments
		public static bool REQUIRE_CLEAR_CACHE = true;

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
			return SteamPath() + "/SteamApps/common/Counter-Strike Global Offensive/csgo";
		}

		/// <summary>
		/// Return the path where JSON files (contains demos data) are stored
		/// </summary>
		/// <returns></returns>
		internal static string GetFolderCachePath()
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
		/// Check if the user has access to awesome world of the Internet
		/// </summary>
		/// <returns></returns>
		[DllImport("wininet.dll")]
		private extern static bool InternetGetConnectedState(out int description, int reservedValue);

		public static bool IsInternetConnectionAvailable()
		{
			int description;
			return InternetGetConnectedState(out description, 0);
		}

		public static List<Rank> RankList = new List<Rank>
		{
			new Rank
			{
				Number = 0,
				Name = "None",
				Logo = "../resources/images/ranks/no_rank.png"
			},
			new Rank
			{
				Number = 1,
				Name = "Silver I",
				Logo = "../resources/images/ranks/elo01.png"
			},
			new Rank
			{
				Number = 2,
				Name = "Silver II",
				Logo = "../resources/images/ranks/elo02.png"
			},
			new Rank
			{
				Number = 3,
				Name = "Silver III",
				Logo = "../resources/images/ranks/elo03.png"
			},
			new Rank
			{
				Number = 4,
				Name = "Silver IV",
				Logo = "../resources/images/ranks/elo04.png"
			},
			new Rank
			{
				Number = 5,
				Name = "Silver Elite",
				Logo = "../resources/images/ranks/elo05.png"
			},
			new Rank
			{
				Number = 6,
				Name = "Silver Elite Master",
				Logo = "../resources/images/ranks/elo06.png"
			},
			new Rank
			{
				Number = 7,
				Name = "Gold Nova I",
				Logo = "../resources/images/ranks/elo07.png"
			},
			new Rank
			{
				Number = 8,
				Name = "Gold Nova II",
				Logo = "../resources/images/ranks/elo08.png"
			},
			new Rank
			{
				Number = 9,
				Name = "Gold Nova III",
				Logo = "../resources/images/ranks/elo09.png"
			},
			new Rank
			{
				Number = 10,
				Name = "Gold Nova Master",
				Logo = "../resources/images/ranks/elo10.png"
			},
			new Rank
			{
				Number = 11,
				Name = "Master Guardian I",
				Logo = "../resources/images/ranks/elo11.png"
			},
			new Rank
			{
				Number = 12,
				Name = "Master Guardian II",
				Logo = "../resources/images/ranks/elo12.png"
			},
			new Rank
			{
				Number = 13,
				Name = "Master Guardian Elite",
				Logo = "../resources/images/ranks/elo13.png"
			},
			new Rank
			{
				Number = 14,
				Name = "Distinguished Master Guardian",
				Logo = "../resources/images/ranks/elo14.png"
			},
			new Rank
			{
				Number = 15,
				Name = "Legendary Eagle",
				Logo = "../resources/images/ranks/elo15.png"
			},
			new Rank
			{
				Number = 16,
				Name = "Legendary Eagle Master",
				Logo = "../resources/images/ranks/elo16.png"
			},
			new Rank
			{
				Number = 17,
				Name = "Supreme Master First Class",
				Logo = "../resources/images/ranks/elo17.png"
			},
			new Rank
			{
				Number = 18,
				Name = "Global Elite",
				Logo = "../resources/images/ranks/elo18.png"
			}
		};
	}
}
