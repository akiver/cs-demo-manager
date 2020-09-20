using System;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using Core;
using ICSharpCode.SharpZipLib.Zip;

namespace Services.Concrete.Movie
{
	public static class FFmpegService
	{
		private const string FFMPEG_VERSION = "4.3.1-2021-01-26";
		private static string ARCHIVE_NAME = $"ffmpeg-{FFMPEG_VERSION}-essentials_build";
		private static string DOWNLOAD_ENDPOINT = $"https://www.gyan.dev/ffmpeg/builds/packages/{ARCHIVE_NAME}.zip";

		/// <summary>
		/// Return the path where FFmpeg is installed.
		/// </summary>
		/// <returns></returns>
		public static string GetFFmpegPath()
		{
			string hlaeFolderPath = HlaeService.GetHlaePath();
			return Path.Combine(hlaeFolderPath, "ffmpeg");
		}

		/// <summary>
		/// Return the location of ffmpeg.exe.
		/// </summary>
		/// <returns></returns>
		public static string GetFFmpegExePath()
		{
			return GetFFmpegPath() + Path.DirectorySeparatorChar + "bin" + Path.DirectorySeparatorChar + "ffmpeg.exe";
		}

		/// <summary>
		/// Return the file's path containing the FFmpeg version installed.
		/// </summary>
		/// <returns></returns>
		public static string GetFFmpegVersionFilePath()
		{
			return AppSettings.GetLocalAppDataPath() + Path.DirectorySeparatorChar + "ffmpeg_version";
		}

		public static bool IsUpdateAvailable()
		{
			string version = GetInstalledVersion();
			if (!string.IsNullOrEmpty(version))
			{
				Version installedVersion = new Version(version);
				string versionWithoutDate = GetVersionWithoutDate();
				Version supportedVersion = new Version(versionWithoutDate);
				return supportedVersion > installedVersion;
			}
			return true;
		}

		public static string GetInstalledVersion()
		{
			if (!IsFFmpegInstalled()) return string.Empty;
			string versionFilePath = GetFFmpegVersionFilePath();
			if (!File.Exists(versionFilePath)) return string.Empty;

			return File.ReadAllText(versionFilePath);
		}

		/// <summary>
		/// Indicates if FFmpeg is installed.
		/// </summary>
		/// <returns></returns>
		public static bool IsFFmpegInstalled()
		{
			return File.Exists(GetFFmpegExePath());
		}

		public static async Task<bool> Install()
		{
			try
			{
				string archivePath = AppSettings.GetLocalAppDataPath() + Path.DirectorySeparatorChar + "ffmepg.zip";
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
		/// Download the last FFmpeg release.
		/// </summary>
		private static async Task<bool> Download(string archivePath)
		{
			using (WebClient webClient = new WebClient())
			{
				try
				{
					Uri uri = new Uri(DOWNLOAD_ENDPOINT);
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
				string destination = AppSettings.GetLocalAppDataPath();
				if (File.Exists(archivePath))
				{
					FastZip fast = new FastZip();
					await Task.Factory.StartNew(() => fast.ExtractZip(archivePath, destination, null));
					string ffmpegPath = GetFFmpegPath();
					if (Directory.Exists(ffmpegPath)) Directory.Delete(ffmpegPath, true);
					Directory.Move(destination + Path.DirectorySeparatorChar + ARCHIVE_NAME, ffmpegPath);
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

		private static void WriteVersion()
		{
			string versionFilePath = GetFFmpegVersionFilePath();
			File.WriteAllText(versionFilePath, GetVersionWithoutDate());
		}

		private static string GetVersionWithoutDate()
		{
			return FFMPEG_VERSION.Split('-')[0];
		}
	}
}
