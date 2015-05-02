using Microsoft.Win32;
using System.IO;
using System.Collections.ObjectModel;
using System;
using System.Linq;

namespace CSGO_Demos_Manager
{
	public static class AppSettings
	{
		public static string AUTHOR = "AkiVer";
		public static string APP_NAME = "CSGO Demos Manager";
		public static string APP_WEBSITE = "http://csgo-demos-manager.com";
		public static string APP_VERSION = "2.0";
		public static string REGISTRY_KEY_DIRECTORIES = "directories";
		// Don't forget to put your Steam API key into the file "steam_api_key.txt"
		public static string STEAM_API_KEY = Properties.Resources.steam_api_key;

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
		/// Check if CSGO is installed
		/// </summary>
		/// <returns>bool true if CSGO is installed, false if not.</returns>
		public static bool IsCsgoInstalled()
		{
			bool isInstalled = true;
			string csgoExe = SteamPath() + "/SteamApps/common/Counter-Strike Global Offensive/csgo.exe";
			if (!File.Exists(SteamExePath()) || !File.Exists(csgoExe))
			{
				isInstalled = false;
			}
			return isInstalled;
		}

		/// <summary>
		/// Return the CSGO path (csgo folder)
		/// </summary>
		/// <returns></returns>
		public static string GetCsgoPath()
		{
			string csgoPath = SteamPath() + "/SteamApps/common/Counter-Strike Global Offensive/csgo";
			if (!Directory.Exists(csgoPath))
			{
				return Path.GetPathRoot(Environment.GetFolderPath(Environment.SpecialFolder.System));
			}
			return csgoPath;
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
					// Try to get "csgo" and "replays" folders
					string csgoPath = GetCsgoPath();
					AddFolder(csgoPath.ToLower());
					folders.Add(csgoPath);
					AddFolder(csgoPath + "/replays".ToLower());
					folders.Add(csgoPath);
				}
			}
			return folders;
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
		internal static void AddFolder(string path)
		{
			RegistryKey keyDirectories = Registry.CurrentUser.OpenSubKey("Software\\" + AUTHOR + "\\" + APP_NAME + "\\" + REGISTRY_KEY_DIRECTORIES, true);
			if (keyDirectories == null)
			{
				keyDirectories = Registry.CurrentUser.CreateSubKey("Software\\" + AUTHOR + "\\" + APP_NAME + "\\" + REGISTRY_KEY_DIRECTORIES);
			}

			if (keyDirectories == null) return;
			int nbDirectories = keyDirectories.ValueCount;
			keyDirectories.SetValue(nbDirectories.ToString(), path.ToLower());
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
	}
}
