using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using Core;
using ICSharpCode.SharpZipLib.Zip;
using Services.Exceptions;

namespace Services.Concrete.Movie
{
    public static class FFmpegService
    {
        public static string GetFFmpegPath()
        {
            if (Properties.Settings.Default.IsFfmpegCustomLocationEnabled)
            {
                return Path.GetDirectoryName(Properties.Settings.Default.FfmpegExecutableLocation);
            }

            string hlaeFolderPath = HlaeService.GetHlaePath();
            return Path.Combine(hlaeFolderPath, "ffmpeg");
        }

        public static string GetFFmpegExePath()
        {
            if (Properties.Settings.Default.IsFfmpegCustomLocationEnabled)
            {
                return Properties.Settings.Default.FfmpegExecutableLocation;
            }

            return GetFFmpegPath() + Path.DirectorySeparatorChar + "bin" + Path.DirectorySeparatorChar + "ffmpeg.exe";
        }

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

                    return extracted;
                }
            }
            catch (Exception e)
            {
                Logger.Instance.Log(e);
            }

            return false;
        }

        public static void EnableCustomLocation(string executablePath)
        {
            AssertExecutableIsValid(executablePath);
            Properties.Settings.Default.FfmpegExecutableLocation = executablePath;
            Properties.Settings.Default.IsFfmpegCustomLocationEnabled = true;
        }

        public static void DisableCustomLocation()
        {
            Properties.Settings.Default.IsFfmpegCustomLocationEnabled = false;
        }

        public static void ResetCustomLocation()
        {
            Properties.Settings.Default.IsFfmpegCustomLocationEnabled = false;
            Properties.Settings.Default.FfmpegExecutableLocation = "";
        }

        private static async Task<bool> Download(string archivePath)
        {
            using (WebClient webClient = new WebClient())
            {
                try
                {
                    Uri uri = new Uri("https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip");
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
                FastZip fast = new FastZip();
                await Task.Factory.StartNew(() => fast.ExtractZip(archivePath, destination, null));
                string ffmpegPath = GetFFmpegPath();
                DirectoryInfo directoryInfo = new DirectoryInfo(destination);
                DirectoryInfo[] ffmpegFolders = directoryInfo.GetDirectories("ffmpeg-*-essentials_build");
                if (ffmpegFolders.Length == 0)
                {
                    throw new Exception("Couldn't find extracted FFmpeg folder.");
                }

                if (Directory.Exists(ffmpegPath))
                {
                    Directory.Delete(ffmpegPath, true);
                }

                Directory.Move(destination + Path.DirectorySeparatorChar + ffmpegFolders[0].Name, ffmpegPath);
                File.Delete(archivePath);

                return true;
            }
            catch (Exception e)
            {
                Logger.Instance.Log(e);
                return false;
            }
        }

        private static void AssertExecutableIsValid(string executablePath)
        {
            try
            {
                Process process = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = executablePath,
                        Arguments = "-version",
                        UseShellExecute = false,
                        RedirectStandardOutput = true,
                        CreateNoWindow = true
                    }
                };
                process.Start();
                string output = process.StandardOutput.ReadToEnd();
                if (!output.StartsWith("ffmpeg version"))
                {
                    throw new InvalidFfmpegExecutableException();
                }
            }
            catch
            {
                throw new InvalidFfmpegExecutableException();
            }
        }
    }
}
