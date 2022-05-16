using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using Core.Models;
using GalaSoft.MvvmLight.CommandWpf;
using Services.Interfaces;
using Services.Models.Stats;

namespace Manager.ViewModel.Demos
{
    public class DemoFlashbangsViewModel : DemoViewModel
    {
        #region Properties

        private readonly IFlashbangService _flashbangService;

        private readonly ICacheService _cacheService;

        private RelayCommand _windowLoadedCommand;

        /// <summary>
        /// Contains all heatmap point used for flash times by player
        /// </summary>
        private List<FlashbangDataPoint> _playersFlashTimes;

        /// <summary>
        /// Contains all heatmap point used for flash times by team
        /// </summary>
        private List<FlashbangDataPoint> _teamsFlashTimes;

        /// <summary>
        /// Contains all heatmap point used for average flash times by player
        /// </summary>
        private List<FlashbangDataPoint> _averagePlayersFlashTimes;

        /// <summary>
        /// Max flash duration for the heatmap by player
        /// </summary>
        private decimal _maxDurationPlayer;

        /// <summary>
        /// Max flash duration for the heatmap by team
        /// </summary>
        private decimal _maxDurationTeam;

        /// <summary>
        /// Max average flash duration for the heatmap AVG by player
        /// </summary>
        private decimal _maxDurationAveragePlayer;

        #endregion

        #region Accessors

        public List<FlashbangDataPoint> PlayersFlashTimes
        {
            get { return _playersFlashTimes; }
            set { Set(() => PlayersFlashTimes, ref _playersFlashTimes, value); }
        }

        public List<FlashbangDataPoint> TeamsFlashTimes
        {
            get { return _teamsFlashTimes; }
            set { Set(() => TeamsFlashTimes, ref _teamsFlashTimes, value); }
        }

        public List<FlashbangDataPoint> AverageFlashTimesPlayers
        {
            get { return _averagePlayersFlashTimes; }
            set { Set(() => AverageFlashTimesPlayers, ref _averagePlayersFlashTimes, value); }
        }

        public List<Team> Teams
        {
            get
            {
                List<Team> teams = new List<Team>
                {
                    Demo.TeamCT,
                    Demo.TeamT,
                };
                return teams;
            }
        }

        public decimal MaxDurationPlayer
        {
            get { return _maxDurationPlayer; }
            set { Set(() => MaxDurationPlayer, ref _maxDurationPlayer, value); }
        }

        public decimal MaxDurationTeam
        {
            get { return _maxDurationTeam; }
            set { Set(() => MaxDurationTeam, ref _maxDurationTeam, value); }
        }

        public decimal MaxDurationAveragePlayer
        {
            get { return _maxDurationAveragePlayer; }
            set { Set(() => MaxDurationAveragePlayer, ref _maxDurationAveragePlayer, value); }
        }

        #endregion

        #region Commands

        public RelayCommand WindowLoaded
        {
            get
            {
                return _windowLoadedCommand
                       ?? (_windowLoadedCommand = new RelayCommand(
                           async () => { await LoadDatas(); }));
            }
        }

        #endregion

        public DemoFlashbangsViewModel(IFlashbangService flashbangService, ICacheService cacheService)
        {
            _flashbangService = flashbangService;
            _cacheService = cacheService;

            if (IsInDesignMode)
            {
                Application.Current.Dispatcher.Invoke(async () => { await LoadDatas(); });
            }
        }

        private async Task LoadDatas()
        {
            IsBusy = true;
            Notification = Properties.Resources.NotificationLoading;
            Demo.PlayerBlinded = await _cacheService.GetDemoPlayerBlindedAsync(Demo);
            _flashbangService.Demo = Demo;
            PlayersFlashTimes = await _flashbangService.GetPlayersFlashTimesData();
            if (PlayersFlashTimes.Any())
            {
                MaxDurationPlayer = PlayersFlashTimes.Max(p => p.Duration);
            }

            TeamsFlashTimes = await _flashbangService.GetTeamsFlashTimesData();
            if (TeamsFlashTimes.Any())
            {
                MaxDurationTeam = TeamsFlashTimes.Max(p => p.Duration);
            }

            AverageFlashTimesPlayers = await _flashbangService.GetAverageFlashTimesPlayersData();
            if (AverageFlashTimesPlayers.Any())
            {
                MaxDurationAveragePlayer = AverageFlashTimesPlayers.Max(p => p.Duration);
            }

            IsBusy = false;
        }

        public override void Cleanup()
        {
            base.Cleanup();
            PlayersFlashTimes.Clear();
            TeamsFlashTimes.Clear();
            AverageFlashTimesPlayers.Clear();
            MaxDurationAveragePlayer = 0;
            MaxDurationPlayer = 0;
            MaxDurationTeam = 0;
        }
    }
}
