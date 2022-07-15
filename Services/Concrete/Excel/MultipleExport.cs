using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Core.Models;
using NPOI.SS.UserModel;
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

        public MultipleExport(MultiExportConfiguration configuration)
        {
            _configuration = configuration;
            _cacheService = new CacheService();
            _generalSheet = new GeneralSheet(Workbook);
            _playersSheet = new PlayersSheet(Workbook);
            _mapsSheet = new MapsSheet(Workbook, _configuration.FocusSteamId);
            _teamsSheet = new TeamsSheet(Workbook);
            _weaponsSheet = new WeaponsSheet(Workbook, _configuration.FocusSteamId);
            _roundsSheet = new RoundsSheet(Workbook);
            _killsSheet = new KillsSheet(Workbook);
            _killMatrixSheet = new KillMatrixSheet(Workbook);
            _flashMatrixPlayersSheet = new FlashMatrixPlayersSheet(Workbook);
            _flashMatrixTeamsSheet = new FlashMatrixTeamsSheet(Workbook);
        }

        public override async Task<IWorkbook> Generate()
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

                if (!_configuration.ForceAnalyze && !_cacheService.HasDemoInCache(demo.Id))
                {
                    try
                    {
                        _configuration.OnAnalyzeStart?.Invoke(demoPath);
                        DemoAnalyzer analyzer = DemoAnalyzer.Factory(demo);
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
                _mapsSheet.AddDemo(demo);
                _teamsSheet.AddDemo(demo);
                _weaponsSheet.AddDemo(demo);
                _roundsSheet.AddDemo(demo);
                _killsSheet.AddDemo(demo);
                _killMatrixSheet.AddDemo(demo);
                _flashMatrixPlayersSheet.AddDemo(demo);
                _flashMatrixTeamsSheet.AddDemo(demo);
            }

            cancellationToken.ThrowIfCancellationRequested();
            _configuration.OnGeneratingXlsxFile?.Invoke();
            await _generalSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();
            await _playersSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();
            await _teamsSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();
            await _mapsSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();
            await _weaponsSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();
            await _roundsSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();
            await _killsSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();
            await _killMatrixSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();
            await _flashMatrixPlayersSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();
            await _flashMatrixTeamsSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();

            return Workbook;
        }
    }
}
