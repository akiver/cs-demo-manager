using System;
using System.Threading.Tasks;
using Services.Concrete.Analyzer;
using Services.Concrete.Excel.Sheets.Single;
using Services.Exceptions.Export;
using Services.Interfaces;

namespace Services.Concrete.Excel
{
    public class SingleExport : AbstractExport
    {
        private readonly ICacheService _cacheService;
        private readonly SingleExportConfiguration _configuration;

        public SingleExport(Workbook workbook, SingleExportConfiguration configuration): base(workbook)
        {
            _configuration = configuration;
            _cacheService = new CacheService();
        }

        public override async Task Generate()
        {
            var cancellationToken = _configuration.CancellationToken.Token;
            var demo = DemoAnalyzer.ParseDemoHeader(_configuration.DemoPath);
            if (demo == null)
            {
                throw new InvalidDemoException();
            }

            if (_configuration.ForceAnalyze || !_cacheService.HasDemoInCache(demo.Id))
            {
                try
                {
                    _configuration.OnAnalyzeStart?.Invoke();
                    var analyzer = DemoAnalyzer.Factory(demo);
                    if (_configuration.Source != null)
                    {
                        demo.Source = _configuration.Source;
                    }

                    demo = await analyzer.AnalyzeDemoAsync(cancellationToken);
                    cancellationToken.ThrowIfCancellationRequested();
                    await _cacheService.WriteDemoDataCache(demo);
                    _configuration.OnAnalyzeSuccess?.Invoke(demo);
                }
                catch (Exception ex)
                {
                    if (ex is OperationCanceledException)
                    {
                        throw ex;
                    }

                    throw new AnalyzeException(ex);
                }
            }
            else
            {
                demo = await _cacheService.GetDemoDataFromCache(demo.Id);
                demo.WeaponFired = await _cacheService.GetDemoWeaponFiredAsync(demo);
                demo.PlayerBlinded = await _cacheService.GetDemoPlayerBlindedAsync(demo);
                cancellationToken.ThrowIfCancellationRequested();
            }

            var generalSheet = new GeneralSheet(Workbook, demo);
            generalSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();

            var playersSheet = new PlayersSheet(Workbook, demo);
            playersSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();

            var roundsSheet = new RoundsSheet(Workbook, demo);
            roundsSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();

            var killsSheet = new KillsSheet(Workbook, demo);
            killsSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();

            var entryHoldKillsRoundSheet = new EntryHoldKillsRoundSheet(Workbook, demo);
            entryHoldKillsRoundSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();

            var entryHoldKillsPlayerSheet = new EntryHoldKillsPlayerSheet(Workbook, demo);
            entryHoldKillsPlayerSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();

            var entryHoldKillsTeamSheet = new EntryHoldKillsTeamSheet(Workbook, demo);
            entryHoldKillsTeamSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();

            var entryKillsRoundSheet = new EntryKillsRoundSheet(Workbook, demo);
            entryKillsRoundSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();

            var entryKillsPlayerSheet = new EntryKillsPlayerSheet(Workbook, demo);
            entryKillsPlayerSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();

            var entryKillsTeamSheet = new EntryKillsTeamSheet(Workbook, demo);
            entryKillsTeamSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();

            var killMatrixSheet = new KillMatrixSheet(Workbook, demo);
            killMatrixSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();

            var flashMatrixPlayersSheet = new FlashMatrixPlayersSheet(Workbook, demo);
            flashMatrixPlayersSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();

            var flashMatrixTeamsSheet = new FlashMatrixTeamsSheet(Workbook, demo);
            flashMatrixTeamsSheet.Generate();
            cancellationToken.ThrowIfCancellationRequested();
        }
    }
}
