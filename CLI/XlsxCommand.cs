using System;
using System.IO;
using System.Threading.Tasks;
using Services.Concrete.Excel;
using Services.Exceptions.Export;

namespace CLI
{
    internal class XlsxCommand : ExportCommand
    {
        public const string COMMAND_NAME = "xlsx";
        private bool _exportIntoSingleFile = false;
        private readonly ExcelService _excelService;

        public XlsxCommand() : base(COMMAND_NAME, @"Export demos into XLSX files")
        {
            _excelService = new ExcelService();
        }

        public override void PrintHelp()
        {
            Console.WriteLine(GetDescription());
            Console.WriteLine(@"");
            Console.WriteLine($@"Usage: {Program.ExeName} {COMMAND_NAME} demoPaths... [--output] [--source] [--single] [--steamid] [--force-analyze]");
            Console.WriteLine(@"");
            Console.WriteLine(@"Demos path can be either .dem files location or a directory. It can be relative or absolute.");
            Console.WriteLine(@"The --output argument specify the directory where output files will be saved.");
            Console.WriteLine($@"The --source argument force the analysis logic of the demo analyzer. Available values: [{string.Join(",", _availableSources)}]");
            Console.WriteLine(@"The --single argument generates a single XLSX file instead of one per demo.");
            Console.WriteLine(@"The --steamid argument makes data in some sheets focusing on the player with the given SteamID (works with --single only).");
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
            ParseArgs(args, new string[] { "--single" });
            for (int index = 0; index < args.Length; index++)
            {
                if (args[index] == "--single")
                {
                    _exportIntoSingleFile = true;
                    break;
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

            try
            {
                if (_exportIntoSingleFile)
                {
                    await ProcessSingleFileExport();
                }
                else
                {
                    await ProcessMultipleFilesExport();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($@"Error while exporting demo: {ex.Message}");
                Environment.Exit(1);
            }
        }

        private async Task ProcessSingleFileExport()
        {
            if (string.IsNullOrEmpty(_outputFolderPath))
            {
                if (IsCurrentDirectoryWritable())
                {
                    _outputFolderPath = Directory.GetCurrentDirectory();
                }
                else
                {
                    _outputFolderPath = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
                }
            }
            string fileName = _outputFolderPath + Path.DirectorySeparatorChar + "export-" + DateTime.Now.ToString("yy-MM-dd-hh-mm-ss") + ".xlsx";
            MultiExportConfiguration configuration = new MultiExportConfiguration
            {
                FileName = fileName,
                DemoPaths = _demoPaths,
                FocusSteamId = _focusSteamId,
                Source = _source,
                ForceAnalyze = _forceAnalyze,
                OnProcessingDemo = (demoPath, demoNumber, totalDemoCount) => Console.WriteLine($@"Retrieving demo {demoNumber}/{totalDemoCount} {demoPath}"),
                OnDemoNotFound = demoPath => Console.WriteLine($@"The demo doesn't exists: {demoPath}"),
                OnInvalidDemo = demoPath => Console.WriteLine($@"Invalid demo {demoPath}"),
                OnAnalyzeStart = demoPath => Console.WriteLine($@"Analyzing demo {demoPath}"),
                OnAnalyzeError = demoPath => Console.WriteLine($@"Error while analyzing demo {demoPath}"),
                OnGeneratingXlsxFile = () => Console.WriteLine(@"Generating XLSX file..."),

            };
            await _excelService.GenerateXls(configuration);
            Console.WriteLine($@"XLSX file generated at {fileName}");
        }

        private async Task ProcessMultipleFilesExport()
        {
            int currentDemoNumber = 0;
            foreach (string demoPath in _demoPaths)
            {
                try
                {
                    Console.WriteLine($@"Retrieving demo {++currentDemoNumber}/{_demoPaths.Count} {demoPath}");
                    string outputFolderPath = BuildOutputFolderPathFromDemoPath(demoPath);
                    string demoName = Path.GetFileName(demoPath);
                    string fileName = outputFolderPath + Path.DirectorySeparatorChar + demoName + ".xlsx";
                    SingleExportConfiguration configuration = new SingleExportConfiguration
                    {
                        DemoPath = demoPath,
                        FileName = fileName,
                        Source = _source,
                        ForceAnalyze = _forceAnalyze,
                        OnAnalyzeStart = () => Console.WriteLine($@"Analyzing demo {demoPath}"),
                    };
                    await _excelService.GenerateXls(configuration);
                    Console.WriteLine($@"XLSX file generated at {fileName}");
                }
                catch (Exception ex)
                {
                    switch (ex)
                    {
                        case FileNotFoundException _:
                            Console.WriteLine($@"The demo doesn't exists: {demoPath}");
                            break;
                        case InvalidDemoException _:
                            Console.WriteLine($@"Invalid demo {demoPath}");
                            break;
                        case AnalyzeException _:
                            Console.WriteLine($@"Error while analyzing demo {demoPath}");
                            break;
                        default:
                            Console.WriteLine($@"An error occurred while exporting demo {demoPath}");
                            break;
                    }
                }
            }
        }
    }
}
