using Microsoft.Win32;
using System.IO;
using System.Collections.ObjectModel;
using System;
using System.Linq;
using System.Runtime.InteropServices;

namespace CSGO_Demos_Manager
{
	public static class AppSettings
	{
		public static string AUTHOR = "AkiVer";
		public static string APP_NAME = "CSGO Demos Manager";
		public static string APP_WEBSITE = "http://csgo-demos-manager.com";
		public static Version APP_VERSION = new Version("2.1.0");
		public static string REGISTRY_KEY_DIRECTORIES = "directories";
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
		/// Check if CSGO is installed, we do not need to know where it's installed to launch the game
		/// </summary>
		/// <returns>bool true if CSGO is installed, false if not.</returns>
		public static bool IsCsgoInstalled()
		{
			var isInstalled = Registry.GetValue(@"HKEY_CURRENT_USER\SOFTWARE\Valve\Steam\Apps\730", "Installed", null);
			if (isInstalled == null || (int)isInstalled == 0) return false;
			return true;
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
	}
}
