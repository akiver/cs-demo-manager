using System.Collections.Generic;
using System.Threading.Tasks;
using System.Windows;
using Core.Models;
using GalaSoft.MvvmLight.CommandWpf;
using GalaSoft.MvvmLight.Messaging;
using GalaSoft.MvvmLight.Threading;
using Manager.Messages;
using Manager.Models;
using Services.Interfaces;
using Services.Models.Charts;

namespace Manager.ViewModel.Accounts
{
    public class AccountRankViewModel : AccountViewModel
    {
        #region Properties

        private readonly IAccountStatsService _accountStatsService;

        private readonly ICacheService _cacheService;

        private List<RankDateChart> _datas;

        private RelayCommand _windowLoadedCommand;

        private ComboboxSelector _selectedScale;

        private List<ComboboxSelector> _scaleList;

        #endregion

        #region Accessors

        public List<RankDateChart> Datas
        {
            get { return _datas; }
            set { Set(() => Datas, ref _datas, value); }
        }

        public List<ComboboxSelector> ScaleList
        {
            get { return _scaleList; }
            set { Set(() => ScaleList, ref _scaleList, value); }
        }

        public ComboboxSelector SelectedScale
        {
            get { return _selectedScale; }
            set
            {
                Set(() => SelectedScale, ref _selectedScale, value);
                Task.Run(async () => await LoadData());
            }
        }

        #endregion

        #region Commands

        public RelayCommand WindowLoaded
        {
            get
            {
                return _windowLoadedCommand
                       ?? (_windowLoadedCommand = new RelayCommand(
                           async () => { await LoadData(); }));
            }
        }

        #endregion

        public AccountRankViewModel(IAccountStatsService accountStatsService, ICacheService cacheService)
        {
            _accountStatsService = accountStatsService;
            _cacheService = cacheService;
            ScaleList = new List<ComboboxSelector>
            {
                new ComboboxSelector("none", Properties.Resources.None),
                new ComboboxSelector("day", Properties.Resources.Day),
                new ComboboxSelector("month", Properties.Resources.Month),
            };
            SelectedScale = ScaleList[0];

            if (IsInDesignMode)
            {
                DispatcherHelper.Initialize();
                Notification = Properties.Resources.NotificationLoading;
                IsBusy = true;
                Application.Current.Dispatcher.Invoke(async () =>
                {
                    Datas = await _accountStatsService.GetRankDateChartDataAsync(new List<Demo>(), SelectedScale.Id);
                });
            }
        }

        private void HandleSettingsFlyoutClosedMessage(SettingsFlyoutClosed msg)
        {
            DispatcherHelper.CheckBeginInvokeOnUI(
                async () => { await LoadData(); });
        }

        public override void Cleanup()
        {
            base.Cleanup();
            Datas = null;
        }

        private async Task LoadData()
        {
            IsBusy = true;
            Notification = Properties.Resources.NotificationLoading;
            List<Demo> demos = await _cacheService.GetFilteredDemoListAsync();
            Datas = await _accountStatsService.GetRankDateChartDataAsync(demos, SelectedScale.Id);
            Messenger.Default.Register<SettingsFlyoutClosed>(this, HandleSettingsFlyoutClosedMessage);
            IsBusy = false;
        }
    }
}
