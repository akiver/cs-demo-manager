using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Core.Models;
using Services.Concrete;
using Services.Concrete.Analyzer;

namespace CLI
{
    internal class JsonCommand : ExportCommand
    {
        public const string COMMAND_NAME = "json";

        public JsonCommand() : base(COMMAND_NAME, @"Export demos into JSON files")
        {
        }

        public override void PrintHelp()
        {
            Console.WriteLine(GetDescription());
            Console.WriteLine(@"");
            Console.WriteLine($@"Usage: {Program.ExeName} {COMMAND_NAME} demoPaths... [--output] [--source] [--force-analyze]");
            Console.WriteLine(@"");
            Console.WriteLine(@"Demos path can be either .dem files location or a directory. It can be relative or absolute.");
            Console.WriteLine(@"The --output argument specify the directory where output files will be saved.");
            Console.WriteLine($@"The --source argument force the analysis logic of the demo analyzer. Available values: [{string.Join(",", _availableSources)}]");
            Console.WriteLine(@"The --force-analyze argument force demos analyzes (ignore cached data).");
            Console.WriteLine(@"");
            Console.WriteLine(@"Examples:");
            Console.WriteLine(@"");
            Console.WriteLine(@"Export a demo:");
            Console.WriteLine($@"    {Program.ExeName} {COMMAND_NAME} ""C:\Users\username\Desktop\demo.dem""");
            Console.WriteLine(@"");
            Console.WriteLine(@"Export multiple demos:");
            Console.WriteLine($@"    {Program.ExeName} {COMMAND_NAME} ""C:\Users\username\Desktop\demo.dem"" ""C:\Users\username\Desktop\demo2.dem""");
            Console.WriteLine(@"");
            Console.WriteLine(@"Export all demos in a directory using the ESL analyzer and save it in a custom directory:");
            Console.WriteLine($@"    {Program.ExeName} {COMMAND_NAME} ""C:\Users\username\Desktop\MyFolder"" --output ""C:\Users\username\Documents"" --source esl");
        }

        private new void ParseArgs(string[] args)
        {
            base.ParseArgs(args, new string[] { });
        }

        public override async Task Run(string[] args)
        {
            ParseArgs(args);

            if (_demoPaths.Count == 0)
            {
                Console.WriteLine(@"No demo paths provided");
                return;
            }

            try
            {
                CacheService cacheService = new CacheService();
                int currentDemoNumber = 0;
                foreach (string demoPath in _demoPaths)
                {
                    Console.WriteLine($@"Retrieving demo {++currentDemoNumber}/{_demoPaths.Count} {demoPath}");
                    Demo demo = DemoAnalyzer.ParseDemoHeader(demoPath);
                    if (demo == null)
                    {
                        Console.WriteLine($@"Invalid demo {demoPath}");
                        continue;
                    }

                    if (_source != null)
                    {
                        demo.Source = _source;
                    }

                    if (!_forceAnalyze && cacheService.HasDemoInCache(demo.Id))
                    {
                        demo = await cacheService.GetDemoDataFromCache(demo.Id);
                        demo.WeaponFired = await cacheService.GetDemoWeaponFiredAsync(demo);
                        demo.PlayerBlinded = await cacheService.GetDemoPlayerBlindedAsync(demo);
                    }
                    else
                    {
                        try
                        {
                            Console.WriteLine($@"Analyzing demo {demoPath}");
                            DemoAnalyzer analyzer = DemoAnalyzer.Factory(demo);
                            demo = await analyzer.AnalyzeDemoAsync(new CancellationTokenSource().Token);
                            await cacheService.WriteDemoDataCache(demo);
                        }
                        catch (Exception)
                        {
                            Console.WriteLine($@"Error while analyzing demo {demoPath}");
                            continue;
                        }
                    }

                    string outputFolderPath = BuildOutputFolderPathFromDemoPath(demoPath);
                    string jsonFilePath = await cacheService.GenerateJsonAsync(demo, outputFolderPath);
                    Console.WriteLine($@"JSON file generated at {jsonFilePath}");
                }
            }
            catch (FileNotFoundException ex)
            {
                Console.WriteLine($@"The demo doesn't exists: {ex.FileName}");
                Environment.Exit(1);
            }
            catch (Exception ex)
            {
                Console.WriteLine($@"Error while exporting demo: {ex.Message}");
                Environment.Exit(1);
            }
        }
    }
}
