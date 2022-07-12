using System;
using System.IO;
using System.Net;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Core;
using ICSharpCode.SharpZipLib.Zip;
using Newtonsoft.Json;
using Services.Exceptions;
using Services.Models.GitHub;

namespace Services.Concrete.Movie
{
    public static class HlaeService
    {
        public const string GITHUB_ENDPOINT = "https://api.github.com/repos/advancedfx/advancedfx/releases";

        public static string GetHlaePath()
        {
            if (Properties.Settings.Default.IsHlaeCustomLocationEnabled)
            {
                return Path.GetDirectoryName(Properties.Settings.Default.HlaeExecutableLocation);
            }

            return Path.Combine(AppSettings.GetLocalAppDataPath(), "hlae");
        }

        public static string GetHlaeVersion()
        {
            try
            {
                return GetHlaeVersionFromExecutable(GetHlaeExePath());
            }
            catch (Exception)
            {
                return null;
            }
        }

        public static string GetHlaeExePath()
        {
            return GetHlaePath() + Path.DirectorySeparatorChar + "hlae.exe";
        }

        public static bool IsHlaeInstalled()
        {
            return File.Exists(GetHlaeExePath()) && GetHlaeVersion() != null;
        }

        public static async Task<bool> IsUpdateAvailable()
        {
            try
            {
                Release release = await GetLastReleaseObject();
                string version = release.TagName.Remove(0, 1);
                string currentVersion = GetHlaeVersion();
                if (string.IsNullOrEmpty(currentVersion))
                {
                    return false;
                }

                return new Version(version) > new Version(currentVersion);
            }
            catch (Exception e)
            {
                Logger.Instance.Log(e);
                return false;
            }
        }

        public static async Task Install()
        {
            string hlaePath = GetHlaePath();
            AssertInstallationPathIsValid(hlaePath);

            Release release = await GetLastReleaseObject();
            if (release?.Assets != null && release.Assets.Count > 0)
            {
                string archivePath = AppSettings.GetLocalAppDataPath() + Path.DirectorySeparatorChar + "hlae.zip";
                string downloadUrl = release.Assets[0].BrowserDownloadUrl;
                await DownloadArchive(downloadUrl, archivePath);

                bool shouldBackupFfmpegFolder = FFmpegService.IsFFmpegInstalled();
                if (shouldBackupFfmpegFolder)
                {
                    BackupFfmpegFolder();
                }

                await ExtractArchive(archivePath);
                if (shouldBackupFfmpegFolder)
                {
                    RestoreFfmpegFolder();
                }
            }
        }

        public static void EnableCustomLocation(string executablePath)
        {
            AssertInstallationPathIsValid(executablePath);
            FileVersionInfo versionInfo = FileVersionInfo.GetVersionInfo(executablePath);
            AssertExecutableIsValid(versionInfo);

            Properties.Settings.Default.HlaeExecutableLocation = executablePath;
            Properties.Settings.Default.IsHlaeCustomLocationEnabled = true;
        }

        public static void DisableCustomLocation()
        {
            Properties.Settings.Default.IsHlaeCustomLocationEnabled = false;
        }

        public static void ResetCustomLocation()
        {
            Properties.Settings.Default.IsHlaeCustomLocationEnabled = false;
            Properties.Settings.Default.HlaeExecutableLocation = "";
        }

        private static async Task<Release> GetLastReleaseObject()
        {
            try
            {
                // GitHub dropped support for TLS 1.0 and 1.1, force to 1.2
                // https://github.com/blog/2507-weak-cryptographic-standards-removed
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
                HttpWebRequest request = WebRequest.Create(GITHUB_ENDPOINT) as HttpWebRequest;
                request.Method = "GET";
                request.Proxy = null;
                request.UserAgent = "advancedfx";

                using (WebResponse response = await request.GetResponseAsync())
                {
                    using (StreamReader reader = new StreamReader(response.GetResponseStream()))
                    {
                        string json = reader.ReadToEnd();
                        List<Release> releases = await Task.Run(() => JsonConvert.DeserializeObject<List<Release>>(json));
                        foreach (Release release in releases)
                        {
                            if (release.PreRelease)
                            {
                                continue;
                            }

                            return release;
                        }
                    }
                }

                throw new Exception("HLAE release not found");
            }
            catch (Exception e)
            {
                Logger.Instance.Log(e);
                return null;
            }
        }

        private static async Task DownloadArchive(string url, string archivePath)
        {
            using (WebClient webClient = new WebClient())
            {
                Uri uri = new Uri(url);
                await Task.Run(() => webClient.DownloadFile(uri, archivePath));
            }
        }

        private static async Task ExtractArchive(string archivePath)
        {
            string destination = GetHlaePath();
            if (Directory.Exists(destination))
            {
                Directory.Delete(destination, true);
            }

            FastZip fast = new FastZip();
            await Task.Run(() => fast.ExtractZip(archivePath, destination, null));
            File.Delete(archivePath);
        }

        private static void BackupFfmpegFolder()
        {
            string ffmpegFolderPath = FFmpegService.GetFFmpegPath();
            if (Directory.Exists(ffmpegFolderPath))
            {
                string ffmpegTemporaryFolderPath = GetTemporaryFfmegDirectoryPath();
                if (Directory.Exists(ffmpegTemporaryFolderPath))
                {
                    Directory.Delete(ffmpegTemporaryFolderPath, true);
                }

                Directory.Move(ffmpegFolderPath, ffmpegTemporaryFolderPath);
            }
        }

        private static void RestoreFfmpegFolder()
        {
            string ffmpegTemporaryFolderPath = GetTemporaryFfmegDirectoryPath();
            if (Directory.Exists(ffmpegTemporaryFolderPath))
            {
                string ffmpegFolderPath = FFmpegService.GetFFmpegPath();
                if (Directory.Exists(ffmpegFolderPath))
                {
                    Directory.Delete(ffmpegFolderPath, true);
                }

                Directory.Move(ffmpegTemporaryFolderPath, ffmpegFolderPath);
            }
        }

        private static string GetHlaeVersionFromExecutable(string executablePath)
        {
            FileVersionInfo versionInfo = FileVersionInfo.GetVersionInfo(executablePath);
            AssertExecutableIsValid(versionInfo);

            return $"{versionInfo.ProductMajorPart}.{versionInfo.ProductMinorPart}.{versionInfo.ProductBuildPart}";
        }

        private static void AssertExecutableIsValid(FileVersionInfo versionInfo)
        {
            if (versionInfo.FileVersion == null || versionInfo.ProductName != "hlae" || versionInfo.CompanyName != "hlae")
            {
                throw new InvalidHlaeExecutableException();
            }
        }

        private static string GetTemporaryFfmegDirectoryPath()
        {
            return Path.Combine(AppSettings.GetLocalAppDataPath(), "ffmpeg-temp");
        }

        private static void AssertInstallationPathIsValid(string path)
        {
            if (!IsValidPath(path))
            {
                throw new InvalidHlaePathException();
            }
        }

        private static bool IsValidPath(string path)
        {
            return Regex.IsMatch(path, "^\\p{IsBasicLatin}*$");
        }
    }
}
