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
            Console.WriteLine($@"Usage: {Program.ExeName} {COMMAND_NAME} demoPaths... [--output] [--source]");
            Console.WriteLine(@"");
            Console.WriteLine(@"Demos path can be either .dem files location or a directory. It can be relative or absolute.");
            Console.WriteLine(@"The --output argument specify the directory where output files will be saved.");
            Console.WriteLine($@"The --source argument force the analysis logic of the demo analyzer. Available values: [{string.Join(",", _availableSources)}]");
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
                foreach (string demoPath in _demoPaths)
                {
                    Console.WriteLine($@"Analyzing demo {demoPath}");
                    Demo demo = DemoAnalyzer.ParseDemoHeader(demoPath);
                    if (_source != null)
                    {
                        demo.Source = _source;
                    }

                    DemoAnalyzer analyzer = DemoAnalyzer.Factory(demo);
                    demo = await analyzer.AnalyzeDemoAsync(new CancellationTokenSource().Token);
                    Console.WriteLine(@"Generating JSON file");
                    string outputFolderPath = BuildOutputFolderPathFromDemoPath(demoPath);
                    CacheService cacheService = new CacheService();
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
