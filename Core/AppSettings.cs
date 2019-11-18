using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;
using Core.Models;
using Microsoft.Win32;

namespace Core
{
	public static class AppSettings
	{
		public static string AUTHOR = "AkiVer";
		public static string APP_NAME = "CSGO Demos Manager";
		public static string APP_WEBSITE = "https://csgo-demos-manager.com";
		public static Version APP_VERSION = new Version("2.13.11");
		private const string MATCH_LIST_FILENAME = "matches.dat";
		public const string PROCESS_NAME = "CSGODemosManager";
		public const string CSGO_PROCESS_NAME = "csgo";
		public const string BOT_PROCESS_NAME = "CSGOSuspectsBot";
		public const string RESOURCES_URI = "pack://application:,,,/csgodm.resources;component/";
		public const string CORE_URI = "pack://application:,,,/csgodm.core;component/";
		// Dummy file name created from the installer to clear data cache at the 1st start of the app
		public const string DUMMY_CACHE_FILENAME = "cache";
		/// <summary>
		/// Number of demos displayed by page
		/// </summary>
		public const int DEMO_PAGE_COUNT = 50;

		// Round end reason strings for serialization
		public const string CT_WIN = "Counter-Terrorists win";
		public const string T_WIN = "Terrorists win";
		public const string BOMB_EXPLODED = "Bomb exploded";
		public const string BOMB_DEFUSED = "Bomb defused";
		public const string CT_SURRENDER = "CT surrender";
		public const string T_SURRENDER = "T surrender";
		public const string TARGET_SAVED = "Time over";

		// Round type strings for serialization
		public const string ECO = "Eco";
		public const string SEMI_ECO = "Semi-Eco";
		public const string NORMAL = "Normal";
		public const string PISTOL_ROUND = "Pistol round";
		public const string FORCE_BUY = "Force buy";

		// Unknown string for serialization
		public const string UNKNOWN = "Unknown";

		public static Regex STEAM_COMMUNITY_URL_REGEX = new Regex("(?:https?:\\/\\/)?steamcommunity\\.com\\/(?:profiles|id)\\/(?<steamID>[a-zA-Z0-9]+)");
		public const string STEAM_COMMUNITY_URL = "https://steamcommunity.com/profiles/{0}";

		public static List<Language> LANGUAGES = new List<Language>()
		{
			new Language
			{
				Key = "ar-EG",
				Name = "Arabic",
				IsEnabled = false
			},
			new Language
			{
				Key = "pt-BR",
				Name = "Brazilian",
				IsEnabled = true
			},
			new Language
			{
				Key = "zh-Hans",
				Name = "Chinese (Simplified)",
				IsEnabled = true
			},
			new Language
			{
				Key = "zh-Hant",
				Name = "Chinese (Traditional)",
				IsEnabled = false
			},
			new Language
			{
				Key = "hr-Hr",
				Name = "Crotian",
				IsEnabled = false
			},
			new Language
			{
				Key = "da-DK",
				Name = "Danish",
				IsEnabled = true
			},
			new Language
			{
				Key = "en-US",
				Name = "English",
				IsEnabled = true
			},
			new Language
			{
				Key = "fr-FR",
				Name = "French",
				IsEnabled = true
			},
			new Language
			{
				Key = "de-DE",
				Name = "German",
				IsEnabled = true
			},
			new Language
			{
				Key = "hu-HU",
				Name = "Hungarian",
				IsEnabled = true
			},
			new Language
			{
				Key = "it-IT",
				Name = "Italian",
				IsEnabled = false
			},
			new Language
			{
				Key = "ja-JP",
				Name = "Japanese",
				IsEnabled = false
			},
			new Language
			{
				Key = "pl-PL",
				Name = "Polish",
				IsEnabled = true
			},
			new Language
			{
				Key = "pt-PT",
				Name = "Portuguese",
				IsEnabled = false
			},
			new Language
			{
				Key = "ru-RU",
				Name = "Russian",
				IsEnabled = false
			},
			new Language
			{
				Key = "sr-Cyrl",
				Name = "Serbian",
				IsEnabled = false
			},
			new Language
			{
				Key = "es-ES",
				Name = "Spanish",
				IsEnabled = true
			},
			new Language
			{
				Key = "tr-TR",
				Name = "Turkish",
				IsEnabled = false
			},
		};

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
			string steamPath = (string)Registry.GetValue("HKEY_CURRENT_USER\\Software\\Valve\\Steam", "SteamPath", "");

			if (steamPath == null) return null;

			steamPath = steamPath.Replace("/", "\\");

			string pathsFile = Path.Combine(steamPath, "steamapps", "libraryfolders.vdf");

			if (!File.Exists(pathsFile))
				return null;

			List<string> libraries = new List<string>
			{
				Path.Combine(steamPath)
			};

			var pathVDF = File.ReadAllLines(pathsFile);

			// This is not a full vdf-parser, but it seems to work pretty much, since the vdf-grammar
			// is pretty easy. Hopefully it never breaks. It should be replaced with a full vdf-parser
			Regex pathRegex = new Regex(@"\""(([^\""]*):\\([^\""]*))\""");
			foreach (var line in pathVDF)
			{
				if (pathRegex.IsMatch(line))
				{
					string match = pathRegex.Matches(line)[0].Groups[1].Value;

					// De-Escape vdf-string
					libraries.Add(match.Replace("\\\\", "\\"));
				}
			}

			foreach (var library in libraries)
			{
				string csgoPath = Path.Combine(library, @"steamapps\common\Counter-Strike Global Offensive\csgo");
				if (Directory.Exists(csgoPath) && File.Exists(Path.Combine(csgoPath, "pak01_000.vpk")))
					return csgoPath;
			}

			return null;
		}

		/// <summary>
		/// Return the location of csgo.exe.
		/// </summary>
		/// <returns></returns>
		public static string GetCsgoExePath()
		{
			string csgoFolderPath = GetCsgoPath();
			if (string.IsNullOrEmpty(csgoFolderPath)) return null;
			string path = Directory.GetParent(csgoFolderPath).FullName + Path.DirectorySeparatorChar + "csgo.exe";
			if (!File.Exists(path)) return null;
			return path;
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
		/// Return the path to the local AppData user's profile.
		/// </summary>
		/// <returns></returns>
		public static string GetLocalAppDataPath()
		{
			return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), AUTHOR);
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

		public static bool IsCsgoRunning()
		{
			return Process.GetProcessesByName(CSGO_PROCESS_NAME).Length > 0;
		}

		/// <summary>
		/// Return the file location that boiler.exe has created
		/// </summary>
		/// <returns></returns>
		public static string GetMatchListDataFilePath()
		{
			return GetFolderCachePath() + Path.DirectorySeparatorChar + MATCH_LIST_FILENAME;
		}

		public static List<Rank> RankList = new List<Rank>
		{
			new Rank
			{
				Number = 0,
				Name = Properties.Resources.Rank0,
				Logo = CORE_URI + "Resources/Images/ranks/no_rank.png"
			},
			new Rank
			{
				Number = 1,
				Name = Properties.Resources.Rank1,
				Logo = CORE_URI + "Resources/Images/ranks/elo01.png"
			},
			new Rank
			{
				Number = 2,
				Name = Properties.Resources.Rank2,
				Logo = CORE_URI + "Resources/Images/ranks/elo02.png"
			},
			new Rank
			{
				Number = 3,
				Name = Properties.Resources.Rank3,
				Logo = CORE_URI + "Resources/Images/ranks/elo03.png"
			},
			new Rank
			{
				Number = 4,
				Name = Properties.Resources.Rank4,
				Logo = CORE_URI + "Resources/Images/ranks/elo04.png"
			},
			new Rank
			{
				Number = 5,
				Name = Properties.Resources.Rank5,
				Logo = CORE_URI + "Resources/Images/ranks/elo05.png"
			},
			new Rank
			{
				Number = 6,
				Name = Properties.Resources.Rank6,
				Logo = CORE_URI + "Resources/Images/ranks/elo06.png"
			},
			new Rank
			{
				Number = 7,
				Name = Properties.Resources.Rank7,
				Logo = CORE_URI + "Resources/Images/ranks/elo07.png"
			},
			new Rank
			{
				Number = 8,
				Name = Properties.Resources.Rank8,
				Logo = CORE_URI + "Resources/Images/ranks/elo8.png"
			},
			new Rank
			{
				Number = 9,
				Name = Properties.Resources.Rank9,
				Logo = CORE_URI + "Resources/Images/ranks/elo09.png"
			},
			new Rank
			{
				Number = 10,
				Name = Properties.Resources.Rank10,
				Logo = CORE_URI + "Resources/Images/ranks/elo10.png"
			},
			new Rank
			{
				Number = 11,
				Name = Properties.Resources.Rank11,
				Logo = CORE_URI + "Resources/Images/ranks/elo11.png"
			},
			new Rank
			{
				Number = 12,
				Name = Properties.Resources.Rank12,
				Logo = CORE_URI + "Resources/Images/ranks/elo12.png"
			},
			new Rank
			{
				Number = 13,
				Name = Properties.Resources.Rank13,
				Logo = CORE_URI + "Resources/Images/ranks/elo13.png"
			},
			new Rank
			{
				Number = 14,
				Name = Properties.Resources.Rank14,
				Logo = CORE_URI + "Resources/Images/ranks/elo14.png"
			},
			new Rank
			{
				Number = 15,
				Name = Properties.Resources.Rank15,
				Logo = CORE_URI + "Resources/Images/ranks/elo15.png"
			},
			new Rank
			{
				Number = 16,
				Name = Properties.Resources.Rank16,
				Logo = CORE_URI + "Resources/Images/ranks/elo16.png"
			},
			new Rank
			{
				Number = 17,
				Name = Properties.Resources.Rank17,
				Logo = CORE_URI + "Resources/Images/ranks/elo17.png"
			},
			new Rank
			{
				Number = 18,
				Name = Properties.Resources.Rank18,
				Logo = CORE_URI + "Resources/Images/ranks/elo18.png"
			}
		};
	}
}
