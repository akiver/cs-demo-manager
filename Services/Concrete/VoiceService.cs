using Core;
using Services.Exceptions.Launcher;
using Services.Exceptions.Voice;
using Services.Interfaces;
using System;
using System.Diagnostics;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Path = System.IO.Path;

namespace Services.Concrete
{
    public class VoiceService : IVoiceService
    {
        private const string CSGO_VOICE_EXTRACTOR_SHA1 = "9F75D6AE81E77F19731B41399E9897024458D8AA";

        private enum CsgoVoiceExtractorExitCode
        {
            InvalidArguments = 10,
            LoadCsgoLibError = 11,
            DemoNotFound = 12,
            ParsingError = 13,
            UnsupportedAudioCodec = 14,
            NoVoiceDataFound = 15,
            DecodingError = 16,
            WavFileCreationError = 17,
        }

        /// <summary>
        /// Exporting players voice could be done in C# but unloading the CSGO DLL crashes the process with an access violation exception.
        /// The issue is not related to C#, it does the same in other languages. It's probably because the CSGO DLL installs a hook which prevents
        /// unloading it till the caller process is still running.
        /// 
        /// Since we don't want to keep the CSGO library loaded in memory, we spawn the program "CSGO voice extractor" originally created for the V3 in a new process.
        /// C# voice extraction gist: https://gist.github.com/akiver/7275418c965bc8d775cfa92ae8bd51e2
        /// </summary>
        public async Task ExportPlayersVoice(string demoPath, string outputFolderPath, CancellationToken ct)
        {
            ct.ThrowIfCancellationRequested();

            string csgoPath = AppSettings.GetCsgoPath();
            if (csgoPath == null)
            {
                throw new CsgoNotFoundException();
            }

            var csgoAudioLibPath = Path.Combine(csgoPath, "..", "bin");
            if (!Directory.Exists(csgoAudioLibPath))
            {
                throw new CsgoAudioLibNotFoundException();
            }

            var requiredFiles = new []
            {
                Path.Combine(csgoAudioLibPath, "vaudio_celt.dll"),
                Path.Combine(csgoAudioLibPath, "tier0.dll"),
            };
            foreach (var requiredFile in requiredFiles)
            {
                if (!File.Exists(requiredFile))
                {
                    throw new CsgoAudioLibNotFoundException();
                }
            }

            string executablePath = AppDomain.CurrentDomain.BaseDirectory + "csgove.exe";
            string hash = Hash.GetSha1HashFile(executablePath);
            if (!hash.Equals(CSGO_VOICE_EXTRACTOR_SHA1))
            {
                throw new InvalidExecutableException();
            }

            var arguments = $"-exit-on-first-error -output \"{outputFolderPath}\" \"{demoPath}\"";
            var psi = new ProcessStartInfo(executablePath)
            {
                Arguments = arguments,
                UseShellExecute = false,
                CreateNoWindow = true,
                EnvironmentVariables =
                {
                    ["LD_LIBRARY_PATH"] = csgoAudioLibPath,
                },
            };
            Process process = new Process
            {
                StartInfo = psi,
            };
            process.Start();
            await process.WaitForExitAsync(ct);

            switch ((CsgoVoiceExtractorExitCode)process.ExitCode)
            {
                case 0:
                    return;
                case CsgoVoiceExtractorExitCode.InvalidArguments:
                    throw new InvalidArgsException();
                case CsgoVoiceExtractorExitCode.LoadCsgoLibError:
                    throw new LoadCsgoAudioLibException();
                case CsgoVoiceExtractorExitCode.DemoNotFound:
                    throw new DemoNotFoundException();
                case CsgoVoiceExtractorExitCode.ParsingError:
                    throw new DemoParsingException();
                case CsgoVoiceExtractorExitCode.UnsupportedAudioCodec:
                    throw new UnsupportedAudioCodecException();
                case CsgoVoiceExtractorExitCode.NoVoiceDataFound:
                    throw new NoVoiceDataException();
                case CsgoVoiceExtractorExitCode.DecodingError:
                    throw new DecodingException();
                case CsgoVoiceExtractorExitCode.WavFileCreationError:
                    throw new CreateAudioFileException();
                default:
                    throw new Exception("Unknown error while exporting players voice");
            }
        }
    }
}
