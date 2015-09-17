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
		public static Version APP_VERSION = new Version("2.1.1");
		public static string REGISTRY_KEY_DIRECTORIES = "directories";
		// Don't forget to put your Steam API key into the file "steam_api_key.txt"
		public static string STEAM_API_KEY = Properties.Resources.steam_api_key;
		// when an update needs to clear data cache, set it to true to prompt the user to save his comments
		public static bool REQUIRE_CLEAR_CACHE = false;

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
		/// Return the list of folders to scan
		/// </summary>
		/// <returns></returns>
		internal static ObservableCollection<string> GetFolders()
		{
			ObservableCollection<string> folders = new ObservableCollection<string>();

			RegistryKey keyDirectories = Registry.CurrentUser.OpenSubKey("Software\\" + AUTHOR + "\\" + APP_NAME + "\\" + REGISTRY_KEY_DIRECTORIES, true);
			if (keyDirectories != null)
			{
				if (!keyDirectories.GetValueNames().Any())
				{
					InitCsgoFolders(folders);
					return folders;
				}

				foreach (var v in keyDirectories.GetValueNames())
				{
					object value = keyDirectories.GetValue(v);
					if (value != null)
					{
						if (!Directory.Exists((string) value))
						{
							RemoveFolder((string) value);
							continue;
						}
						folders.Add((string) value);
					}
				}
			}
			else
			{
				if (IsCsgoInstalled())
				{
					InitCsgoFolders(folders);
				}
			}

			return folders;
		}

		/// <summary>
		/// Add the defaults "csgo" and "replays" folder to the list
		/// If they doesn't they will not be added
		/// </summary>
		/// <param name="folders"></param>
		private static void AddDefaultFolders(ObservableCollection<string> folders)
		{
			string csgoPath = Path.GetFullPath(GetCsgoPath());
			if (Directory.Exists(csgoPath))
			{
				AddFolder(csgoPath);
				folders.Add(csgoPath);
			}
			string replaysPath = Path.GetFullPath(csgoPath + "/replays");
			if (Directory.Exists(replaysPath))
			{
				AddFolder(replaysPath);
				folders.Add(replaysPath);
			}
		}

		/// <summary>
		/// Remove a folder from registry
		/// </summary>
		/// <param name="path"></param>
		internal static void RemoveFolder(string path)
		{
			RegistryKey keyDirectories = Registry.CurrentUser.OpenSubKey("Software\\" + AUTHOR + "\\" + APP_NAME + "\\" + REGISTRY_KEY_DIRECTORIES, true);
			if (keyDirectories != null)
			{
				foreach (var v in keyDirectories.GetValueNames())
				{
					object value = keyDirectories.GetValue(v);
					if (value != null && String.Equals(((string)value), path, StringComparison.CurrentCultureIgnoreCase))
					{
						keyDirectories.DeleteValue(v);
					}
				}
			}
		}

		/// <summary>
		/// Add a folder to registry
		/// </summary>
		/// <param name="path"></param>
		internal static bool AddFolder(string path)
		{
			RegistryKey keyDirectories = Registry.CurrentUser.OpenSubKey("Software\\" + AUTHOR + "\\" + APP_NAME + "\\" + REGISTRY_KEY_DIRECTORIES, true);
			if (keyDirectories == null)
			{
				keyDirectories = Registry.CurrentUser.CreateSubKey("Software\\" + AUTHOR + "\\" + APP_NAME + "\\" + REGISTRY_KEY_DIRECTORIES);
			}

			if (keyDirectories == null) return false;

			// Don't add it if it's already in the list
			if (keyDirectories.GetValueNames().Any())
			{
				if (keyDirectories.GetValueNames().Any(valueName => string.Compare(valueName, path, StringComparison.InvariantCultureIgnoreCase) == 0)) return false;
			}

			int nbDirectories = keyDirectories.ValueCount;
			keyDirectories.SetValue(nbDirectories.ToString(), path);
			return true;
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
		/// Set the "csgo" and "replays" folders if they exist
		/// </summary>
		public static void InitCsgoFolders(ObservableCollection<string> folders = null)
		{
			string csgoFolderPath = Path.GetFullPath(GetCsgoPath()).ToLower();
			if (Directory.Exists(csgoFolderPath))
			{
				AddFolder(csgoFolderPath);
				folders?.Add(csgoFolderPath);
			}
			string replayFolderPath = Path.GetFullPath(csgoFolderPath + "/replays").ToLower();
			if (Directory.Exists(replayFolderPath))
			{
				AddFolder(replayFolderPath);
				folders?.Add(replayFolderPath);
			}
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
