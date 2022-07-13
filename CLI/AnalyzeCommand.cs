using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Core.Models;
using Core.Models.Source;
using Services.Concrete;
using Services.Concrete.Analyzer;

namespace CLI
{
    internal class AnalyzeCommand : BaseCommand
    {
        public const string COMMAND_NAME = "analyze";
        protected Source _source;
        protected readonly List<string> _demoPaths = new List<string>();
        protected List<string> _availableSources = new List<string>();
        protected bool _forceAnalyze = false;

        public AnalyzeCommand() : base(COMMAND_NAME, @"Analyze demos, data will be available from the GUI.")
        {
            foreach (Source source in Source.Sources)
            {
                if (source.Name != Pov.NAME)
                {
                    _availableSources.Add(source.Name);
                }
            }
        }

        public override async Task Run(string[] args)
        {
            ParseArgs(args);

            if (_demoPaths.Count == 0)
            {
                Console.WriteLine(@"No demo paths provided");
                return;
            }

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

                if (!_forceAnalyze && cacheService.HasDemoInCache(demo.Id))
                {
                    Console.WriteLine($@"Demo {demoPath} already analyzed.");
                    continue;
                }

                try
                {
                    if (_source != null)
                    {
                        demo.Source = _source;
                    }

                    Console.WriteLine($@"Analyzing demo {demoPath}");
                    DemoAnalyzer analyzer = DemoAnalyzer.Factory(demo);
                    demo = await analyzer.AnalyzeDemoAsync(new CancellationTokenSource().Token);
                    await cacheService.WriteDemoDataCache(demo);
                }
                catch (Exception)
                {
                    Console.WriteLine($@"Error while analyzing demo {demoPath}");
                }
            }
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
                        case "--source":
                            if (args.Length > index + 1)
                            {
                                index += 1;
                                string sourceName = args[index];
                                _source = Source.Factory(sourceName);
                                if (_source == null)
                                {
                                    Console.WriteLine($@"Invalid source: {sourceName}");
                                    Environment.Exit(1);
                                }
                            }
                            else
                            {
                                Console.WriteLine(@"Missing --source argument value");
                                Environment.Exit(1);
                            }

                            break;
                        case "--force":
                            _forceAnalyze = true;
                            break;
                        default:
                            Console.WriteLine($@"Unknown option {arg}");
                            Environment.Exit(1);
                            break;
                    }
                }
                else
                {
                    bool isDemoFile = arg.EndsWith(".dem");
                    if (isDemoFile)
                    {
                        bool fileExists = File.Exists(arg);
                        if (!fileExists)
                        {
                            Console.WriteLine($@"The file doesn't exists: {arg}");
                            Environment.Exit(1);
                        }

                        if (_demoPaths.Contains(arg))
                        {
                            continue;
                        }

                        _demoPaths.Add(arg);
                    }
                    else
                    {
                        try
                        {
                            if (arg.EndsWith("\""))
                            {
                                arg = arg.Substring(0, arg.Length - 1) + "\\";
                            }

                            string directoryPath = Path.GetFullPath(arg);
                            bool directoryExists = Directory.Exists(directoryPath);
                            if (directoryExists)
                            {
                                string[] files = Directory.GetFiles(directoryPath, "*.dem");
                                foreach (string file in files)
                                {
                                    if (_demoPaths.Contains(file))
                                    {
                                        continue;
                                    }

                                    _demoPaths.Add(file);
                                }
                            }
                            else
                            {
                                Console.WriteLine($@"The directory doesn't exists: {arg}");
                                Environment.Exit(1);
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($@"Invalid directory: {ex.Message}");
                            Environment.Exit(1);
                        }
                    }
                }
            }
        }

        public override void PrintHelp()
        {
            Console.WriteLine(GetDescription());
            Console.WriteLine(@"");
            Console.WriteLine($@"Usage: {Program.ExeName} {COMMAND_NAME} demoPaths... [--source] [--force]");
            Console.WriteLine(@"");
            Console.WriteLine(@"Demos path can be either .dem files location or a directory. It can be relative or absolute.");
            Console.WriteLine($@"The --source argument force the analysis logic of the demo analyzer. Available values: [{string.Join(",", _availableSources)}]");
            Console.WriteLine(@"The --force argument force demos analyzes (ignore cached data).");
            Console.WriteLine(@"");
            Console.WriteLine(@"Examples:");
            Console.WriteLine(@"");
            Console.WriteLine(@"Analyze 1 demo:");
            Console.WriteLine($@"    {Program.ExeName} {COMMAND_NAME} ""C:\Users\username\Desktop\demo.dem""");
            Console.WriteLine(@"");
            Console.WriteLine(@"Analyze multiple demos:");
            Console.WriteLine($@"    {Program.ExeName} {COMMAND_NAME} ""C:\Users\username\Desktop\demo.dem"" ""C:\Users\username\Desktop\demo2.dem""");
            Console.WriteLine(@"");
            Console.WriteLine(@"Analyze all demos in a directory using the ESL analyzer and re-analyze demos that have already been analyzed:");
            Console.WriteLine($@"    {Program.ExeName} {COMMAND_NAME} ""C:\Users\username\Desktop\MyFolder"" --source esl --force");
        }
    }
}
