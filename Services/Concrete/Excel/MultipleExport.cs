using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Core.Models;
using Services.Concrete.Analyzer;
using Services.Concrete.Excel.Sheets.Multiple;
using Services.Interfaces;

namespace Services.Concrete.Excel
{
    public class MultipleExport : AbstractExport
    {
        private readonly GeneralSheet _generalSheet;
        private readonly PlayersSheet _playersSheet;
        private readonly MapsSheet _mapsSheet;
        private readonly TeamsSheet _teamsSheet;
        private readonly WeaponsSheet _weaponsSheet;
        private readonly RoundsSheet _roundsSheet;
        private readonly KillsSheet _killsSheet;
        private readonly KillMatrixSheet _killMatrixSheet;
        private readonly FlashMatrixPlayersSheet _flashMatrixPlayersSheet;
        private readonly FlashMatrixTeamsSheet _flashMatrixTeamsSheet;
        private readonly ICacheService _cacheService;
        private readonly MultiExportConfiguration _configuration;
        private int _currentDemoNumber = 0;

        public MultipleExport(Workbook workbook, MultiExportConfiguration configuration): base(workbook)
        {
            _configuration = configuration;
            _cacheService = new CacheService();
            _generalSheet = new GeneralSheet(workbook);
            _roundsSheet = new RoundsSheet(workbook);
            _playersSheet = new PlayersSheet(workbook);
            _teamsSheet = new TeamsSheet(workbook);
            _mapsSheet = new MapsSheet(workbook, _configuration.FocusSteamId);
            _killsSheet = new KillsSheet(workbook);
            _weaponsSheet = new WeaponsSheet(workbook, _configuration.FocusSteamId);
            _killMatrixSheet = new KillMatrixSheet(workbook);
            _flashMatrixPlayersSheet = new FlashMatrixPlayersSheet(workbook);
            _flashMatrixTeamsSheet = new FlashMatrixTeamsSheet(workbook);
        }

        public override async Task Generate()
        {
            CancellationToken cancellationToken = _configuration.CancellationToken.Token;
            foreach (string demoPath in _configuration.DemoPaths)
            {
                cancellationToken.ThrowIfCancellationRequested();

                ++_currentDemoNumber;
                _configuration.OnProcessingDemo?.Invoke(demoPath, _currentDemoNumber, _configuration.DemoPaths.Count);

                if (!File.Exists(demoPath))
                {
                    _configuration.OnDemoNotFound?.Invoke(demoPath);
                    continue;
                }

                Demo demo = DemoAnalyzer.ParseDemoHeader(demoPath);
                if (demo == null)
                {
                    _configuration.OnInvalidDemo?.Invoke(demoPath);
                    continue;
                }

                if (_configuration.ForceAnalyze || !_cacheService.HasDemoInCache(demo.Id))
                {
                    try
                    {
                        _configuration.OnAnalyzeStart?.Invoke(demoPath);
                        DemoAnalyzer analyzer = DemoAnalyzer.Factory(demo, demo.SourceName);
                        if (_configuration.Source != null)
                        {
                            demo.Source = _configuration.Source;
                        }
                        demo = await analyzer.AnalyzeDemoAsync(cancellationToken);
                        cancellationToken.ThrowIfCancellationRequested();
                        await _cacheService.WriteDemoDataCache(demo);
                        _configuration.OnAnalyzeSuccess?.Invoke(demo);
                    }
                    catch (OperationCanceledException ex)
                    {
                        throw ex;
                    }
                    catch (Exception)
                    {
                        _configuration.OnAnalyzeError?.Invoke(demoPath);
                        continue;
                    }
                }
                else
                {
                    demo = await _cacheService.GetDemoDataFromCache(demo.Id);
                    demo.WeaponFired = await _cacheService.GetDemoWeaponFiredAsync(demo);
                    demo.PlayerBlinded = await _cacheService.GetDemoPlayerBlindedAsync(demo);
                }

                cancellationToken.ThrowIfCancellationRequested();
                _generalSheet.AddDemo(demo);
                _playersSheet.AddDemo(demo);
                _teamsSheet.AddDemo(demo);
                _mapsSheet.AddDemo(demo);
                _weaponsSheet.AddDemo(demo);
                _roundsSheet.AddDemo(demo);
                _killsSheet.AddDemo(demo);
                _killMatrixSheet.AddDemo(demo);
                _flashMatrixPlayersSheet.AddDemo(demo);
                _flashMatrixTeamsSheet.AddDemo(demo);
            }

            cancellationToken.ThrowIfCancellationRequested();
            _configuration.OnGeneratingXlsxFile?.Invoke();
            _generalSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();
            _playersSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();
            _teamsSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();
            _mapsSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();
            _weaponsSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();
            _roundsSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();
            _killsSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();
            _killMatrixSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();
            _flashMatrixPlayersSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();
            _flashMatrixTeamsSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();
        }
    }
}
