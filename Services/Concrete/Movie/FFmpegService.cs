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
		public const string FFMPEG_VERSION = "3.4.1";
		public const string ARCHIVE_NAME = "ffmpeg-{0}-{1}-static";
		public const string DOWNLOAD_ENDPOINT = "https://ffmpeg.zeranoe.com/builds/{0}/static/{1}.zip";

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

		private static string GetArchiveName()
		{
			return string.Format(ARCHIVE_NAME, FFMPEG_VERSION, Environment.Is64BitOperatingSystem ? "win64" : "win32");
		}

		public static bool IsUpdateAvailable()
		{
			string version = GetInstalledVersion();
			if (!string.IsNullOrEmpty(version))
			{
				Version installedVersion = new Version(version);
				Version supportedVersion = new Version(FFMPEG_VERSION);
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
					Uri uri = new Uri(string.Format(DOWNLOAD_ENDPOINT, Environment.Is64BitOperatingSystem ? "win64" : "win32", GetArchiveName()));
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
					Directory.Move(destination + Path.DirectorySeparatorChar + GetArchiveName(), ffmpegPath);
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
			File.WriteAllText(versionFilePath, FFMPEG_VERSION);
		}
	}
}
