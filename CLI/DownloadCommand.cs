using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Core;
using Services.Concrete;
using Services.Exceptions;
using Services.Interfaces;

namespace CLI
{
    internal class DownloadCommand : BaseCommand
    {
        public const string COMMAND_NAME = "download";
        private string _outputFolderPath;
        private readonly ISteamService _steamService;
        private readonly IDemosService _demoService;
        private readonly CancellationTokenSource _cts;
        private readonly List<string> _shareCodes;

        public DownloadCommand() : base(COMMAND_NAME, @"Download last MM demos of the current Steam account or from share codes")
        {
            _shareCodes = new List<string>();
            _cts = new CancellationTokenSource();
            _steamService = new SteamService();
            _demoService = new DemosService(_steamService);
            BuildDefaultOutputFolderPath();
        }

        public override void PrintHelp()
        {
            Console.WriteLine(GetDescription());
            Console.WriteLine(@"");
            Console.WriteLine($@"Usage: {Program.ExeName} {COMMAND_NAME} [shareCodes...] [--output]");
            Console.WriteLine(@"");
            Console.WriteLine(@"The --output argument specify the directory where demos will be downloaded.");
            Console.WriteLine(@"Default to the CSGO ""replays"" folder or the current directory if the ""replays"" folder doesn't exsits.");
            Console.WriteLine(@"");
            Console.WriteLine(@"Examples:");
            Console.WriteLine(@"");
            Console.WriteLine(@"To download last MM demos of the current Steam account:");
            Console.WriteLine($@"    {Program.ExeName} {COMMAND_NAME}");
            Console.WriteLine(@"");
            Console.WriteLine(@"To download demos from share codes:");
            Console.WriteLine($@"    {Program.ExeName} {COMMAND_NAME} CSGO-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX CSGO-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX");
            Console.WriteLine(@"");
            Console.WriteLine(@"To change the directory where demos will be downloaded:");
            Console.WriteLine($@"    {Program.ExeName} {COMMAND_NAME} --output ""C:\Users\username\Downloads""");
        }

        private new void ParseArgs(string[] args)
        {
            base.ParseArgs(args);

            for (int index = 0; index < args.Length; index++)
            {
                string arg = args[index];
                bool isOption = arg.StartsWith("--");
                if (isOption)
                {
                    switch (arg)
                    {
                        case "--output":
                            if (args.Length > index + 1)
                            {
                                index += 1;

                                string directoryPath = Path.GetFullPath(args[index]);
                                bool folderExists = Directory.Exists(directoryPath);
                                if (!folderExists)
                                {
                                    Console.WriteLine(@"The output folder doesn't exists");
                                    Environment.Exit(1);
                                }

                                if (!IsDirectoryWritable(directoryPath))
                                {
                                    Console.WriteLine(@"The output folder is not writable");
                                    Environment.Exit(1);
                                }

                                _outputFolderPath = directoryPath;
                            }
                            else
                            {
                                Console.WriteLine(@"Missing --output argument value");
                                Environment.Exit(1);
                            }

                            break;
                        default:
                            Console.WriteLine($@"Unknown option {arg}");
                            Environment.Exit(1);
                            break;
                    }
                }
                else
                {
                    if (_shareCodes.Contains(arg))
                    {
                        continue;
                    }

                    try
                    {
                        ShareCode.Decode(arg);
                        _shareCodes.Add(arg);
                    }
                    catch (ShareCode.ShareCodePatternException)
                    {
                        Console.WriteLine($@"Invalid share code {arg}");
                        Environment.Exit(1);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex);
                        Environment.Exit(1);
                    }
                }
            }
        }

        public override async Task Run(string[] args)
        {
            ParseArgs(args);

            if (_shareCodes.Count > 0)
            {
                foreach (string shareCode in _shareCodes)
                {
                    Console.WriteLine($@"Retrieving match from share code {shareCode}...");
                    try
                    {
                        int exitCode = await _steamService.DownloadDemoFromShareCode(shareCode, _cts.Token);
                        await HandleBoilerExitCode(exitCode);
                    }
                    catch (InvalidBoilerExecutableException)
                    {
                        Console.WriteLine(@"Invalid boiler executable");
                        Environment.Exit(1);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($@"Error while downloading demo from share code {shareCode}: {ex.Message}");
                        Environment.Exit(1);
                    }
                }
            }
            else
            {
                try
                {
                    Console.WriteLine(@"Retrieving recent matches for current Steam account...");
                    int exitCode = await _steamService.GenerateMatchListFile(_cts.Token);
                    await HandleBoilerExitCode(exitCode);
                }
                catch (InvalidBoilerExecutableException)
                {
                    Console.WriteLine(@"Invalid boiler executable");
                    Environment.Exit(1);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($@"Error while downloading demos: {ex.Message}");
                    Environment.Exit(1);
                }
            }
        }

        private async Task HandleBoilerExitCode(int exitCode)
        {
            switch (exitCode)
            {
                case (int)BoilerExitCode.Success:
                    await DownloadDemos();
                    break;
                case (int)BoilerExitCode.FatalError:
                    Console.WriteLine($@"Fatal error");
                    break;
                case (int)BoilerExitCode.InvalidArguments:
                    Console.WriteLine(@"Invalid arguments");
                    break;
                case (int)BoilerExitCode.CommunicationFailure:
                    Console.WriteLine(@"CSGO Game coordinator communication failure");
                    break;
                case (int)BoilerExitCode.AlreadyConnectedToGC:
                    Console.WriteLine(@"Already connected to CSGO GC, make sure to close CSGO and retry");
                    break;
                case (int)BoilerExitCode.SteamRestartRequired:
                    Console.WriteLine(@"Steam needs to be restarted");
                    break;
                case (int)BoilerExitCode.SteamNotRunningOrLoggedIn:
                    Console.WriteLine(@"Steam is not running or the current account is not logged in");
                    break;
                case (int)BoilerExitCode.SteamUserNotLoggedIn:
                    Console.WriteLine(@"Current Steam account not connected (maybe offline)");
                    break;
                case (int)BoilerExitCode.NoMatchesFound:
                    Console.WriteLine(_shareCodes.Count > 0 ? @"Demo link expired" : @"No matches found");
                    break;
                case (int)BoilerExitCode.WriteFileFailure:
                    Console.WriteLine(@"An error occurred while writing matches file.");
                    break;
                default:
                    Console.WriteLine($@"Unknown error (code: {exitCode})");
                    break;
            }
        }

        private async Task DownloadDemos()
        {
            try
            {
                _demoService.DownloadFolderPath = _outputFolderPath;
                Dictionary<string, string> demoUrlPerDemoName = await _demoService.GetDemoListUrl();
                if (demoUrlPerDemoName.Count > 0)
                {
                    Console.WriteLine(@"Downloading demos...");
                    Console.WriteLine($@"Destination folder: {_demoService.DownloadFolderPath}");
                    for (int index = 1; index < demoUrlPerDemoName.Count + 1; index++)
                    {
                        string demoName = demoUrlPerDemoName.ElementAt(index - 1).Key;
                        string demoUrl = demoUrlPerDemoName.ElementAt(index - 1).Value;
                        Console.WriteLine($@"Downloading demo {demoUrl}");
                        await _demoService.DownloadDemo(demoUrl, demoName);
                        Console.WriteLine($@"Extracting demo archive {demoUrl}");
                        await _demoService.DecompressDemoArchive(demoName);
                    }

                    Console.WriteLine($@"Demos downloaded in {_demoService.DownloadFolderPath}");
                }
                else
                {
                    Console.WriteLine(@"No matches found or demos already exist in output folder");
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        private void BuildDefaultOutputFolderPath()
        {
            string csgoFolderPath = AppSettings.GetCsgoPath();
            string replaysFolderPath = Path.GetFullPath(csgoFolderPath + Path.DirectorySeparatorChar + "replays");
            if (Directory.Exists(replaysFolderPath))
            {
                _outputFolderPath = replaysFolderPath;
                return;
            }

            if (IsCurrentDirectoryWritable())
            {
                _outputFolderPath = Directory.GetCurrentDirectory();
            }
            else
            {
                _outputFolderPath = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
            }
        }
    }
}
