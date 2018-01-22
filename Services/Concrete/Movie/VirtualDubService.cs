using System;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using Core;
using ICSharpCode.SharpZipLib.Zip;

namespace Services.Concrete.Movie
{
	public static class VirtualDubService
	{
		public const string VIRTUALDUB_VERSION = "1.10.4";
		public const string DOWNLOAD_ENDPOINT = "https://freefr.dl.sourceforge.net/project/virtualdub/virtualdub-win/1.10.4.35491/{0}.zip";

		/// <summary>
		/// Return the path where VirtualDub is installed.
		/// </summary>
		/// <returns></returns>
		public static string GetVirtualDubPath()
		{
			return Path.Combine(AppSettings.GetLocalAppDataPath(), "virtualdub");
		}

		/// <summary>
		/// Return the VirtualDub.exe path.
		/// </summary>
		/// <returns></returns>
		public static string GetVirtualDubExePath()
		{
			string exeName = Environment.Is64BitOperatingSystem ? "Veedub64.exe" : "VirtualDub.exe";
			return GetVirtualDubPath() + Path.DirectorySeparatorChar + exeName;
		}

		/// <summary>
		/// Return the file's path containing the VirtualDub version number installed.
		/// </summary>
		/// <returns></returns>
		public static string GetVirtualDubVersionFilePath()
		{
			return GetVirtualDubPath() + Path.DirectorySeparatorChar + "version";
		}

		/// <summary>
		/// Return the archive's name to be downloaded.
		/// </summary>
		/// <returns></returns>
		private static string GetArchiveName()
		{
			return Environment.Is64BitOperatingSystem ? "VirtualDub-1.10.4-AMD64" : "VirtualDub-1.10.4";
		}

		/// <summary>
		/// Just in case a new VirtualDub is released one day.
		/// </summary>
		/// <returns></returns>
		public static bool IsUpdateAvailable()
		{
			string version = GetInstalledVersion();
			if (version != null)
			{
				Version installedVersion = new Version(version);
				Version supportedVersion = new Version(VIRTUALDUB_VERSION);
				return supportedVersion > installedVersion;
			}

			return true;
		}

		/// <summary>
		/// Return the version currently installed.
		/// </summary>
		/// <returns></returns>
		public static string GetInstalledVersion()
		{
			string versionFilePath = GetVirtualDubVersionFilePath();
			if (!File.Exists(versionFilePath)) return string.Empty;

			return File.ReadAllText(versionFilePath);
		}

		/// <summary>
		/// Indicates if VirtualDub is installed.
		/// </summary>
		/// <returns></returns>
		public static bool IsVirtualDubInstalled()
		{
			return File.Exists(GetVirtualDubExePath()) && File.Exists(GetVirtualDubVersionFilePath());
		}

		public static async Task<bool> Install()
		{
			try
			{
				string archivePath = AppSettings.GetLocalAppDataPath() + Path.DirectorySeparatorChar + "virtualdub.zip";
				bool downloaded = await Download(archivePath);
				if (downloaded)
				{
					bool extracted = await ExtractArchive(archivePath);
					if (extracted) WriteVersion();

					return extracted;
				}
			}
			catch (Exception e)
			{
				Logger.Instance.Log(e);
			}

			return false;
		}

		/// <summary>
		/// Download the last VirtualDub release.
		/// </summary>
		private static async Task<bool> Download(string archivePath)
		{
			using (WebClient webClient = new WebClient())
			{
				try
				{
					Uri uri = new Uri(string.Format(DOWNLOAD_ENDPOINT, GetArchiveName()));
					await Task.Factory.StartNew(() => webClient.DownloadFile(uri, archivePath));
					return true;
				}
				catch (Exception e)
				{
					Logger.Instance.Log(e);
					return false;
				}
			}
		}

		private static async Task<bool> ExtractArchive(string archivePath)
		{
			try
			{
				string destination = AppSettings.GetLocalAppDataPath() + Path.DirectorySeparatorChar + "virtualdub";
				if (File.Exists(archivePath))
				{
					FastZip fast = new FastZip();
					await Task.Factory.StartNew(() => fast.ExtractZip(archivePath, destination, null));
					File.Delete(archivePath);
				}
				return true;

			}
			catch (Exception e)
			{
				Logger.Instance.Log(e);
				return false;
			}
		}

		/// <summary>
		/// Write the current version installed from the app to handle possible update.
		/// </summary>
		private static void WriteVersion()
		{
			string versionFilePath = GetVirtualDubVersionFilePath();
			File.WriteAllText(versionFilePath, VIRTUALDUB_VERSION);
		}
	}
}
