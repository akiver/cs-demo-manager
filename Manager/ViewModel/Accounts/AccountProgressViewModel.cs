using System.Collections.Generic;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using Core.Models;
using GalaSoft.MvvmLight.CommandWpf;
using GalaSoft.MvvmLight.Messaging;
using GalaSoft.MvvmLight.Threading;
using Manager.Messages;
using Services.Interfaces;
using Services.Models.Charts;
using Services.Models.Stats;

namespace Manager.ViewModel.Accounts
{
    public class AccountProgressViewModel : AccountViewModel
    {
        #region Properties

        private readonly IAccountStatsService _accountStatsService;

        private readonly ICacheService _cacheService;

        private bool _isWinChartEnabled = true;

        private bool _isDamageChartEnabled = true;

        private bool _isHeadshotChartEnabled = true;

        private bool _isCrouchKillChartEnabled = true;

        private bool _isVelocityRifleChartEnabled = true;

        private bool _isVelocityPistolChartEnabled = true;

        private bool _isVelocitySniperChartEnabled = true;

        private bool _isVelocityHeavyChartEnabled = true;

        private bool _isVelocitySmgChartEnabled = true;

        private double _maximumVelocity = 250;

        private List<HeadshotDateChart> _datasHeadshot = new List<HeadshotDateChart>();

        private List<CrouchKillDateChart> _datasCrouchKill = new List<CrouchKillDateChart>();

        private List<DamageDateChart> _datasDamage = new List<DamageDateChart>();

        private List<WinDateChart> _datasWin = new List<WinDateChart>();

        private List<KillDateChart> _datasKill = new List<KillDateChart>();

        private List<KillVelocityChart> _velocityRifle = new List<KillVelocityChart>();

        private List<KillVelocityChart> _velocityPistol = new List<KillVelocityChart>();

        private List<KillVelocityChart> _velocitySniper = new List<KillVelocityChart>();

        private List<KillVelocityChart> _velocityHeavy = new List<KillVelocityChart>();

        private List<KillVelocityChart> _velocitySmg = new List<KillVelocityChart>();

        private RelayCommand _windowLoadedCommand;

        private RelayCommand<bool> _toggleWinChartCommand;

        private RelayCommand<bool> _toggleDamageChartCommand;

        private RelayCommand<bool> _toggleHeadshotChartCommand;

        private RelayCommand<bool> _toggleCrouchKillChartCommand;

        private RelayCommand<bool> _toggleVelocityRifleChartCommand;

        private RelayCommand<bool> _toggleVelocitySniperChartCommand;

        private RelayCommand<bool> _toggleVelocityPistolChartCommand;

        private RelayCommand<bool> _toggleVelocityHeavyChartCommand;

        private RelayCommand<bool> _toggleVelocitySmgChartCommand;

        #endregion

        #region Accessors

        public bool IsWinChartEnabled
        {
            get { return _isWinChartEnabled; }
            set { Set(() => IsWinChartEnabled, ref _isWinChartEnabled, value); }
        }

        public bool IsDamageChartEnabled
        {
            get { return _isDamageChartEnabled; }
            set { Set(() => IsDamageChartEnabled, ref _isDamageChartEnabled, value); }
        }

        public bool IsHeadshotChartEnabled
        {
            get { return _isHeadshotChartEnabled; }
            set { Set(() => IsHeadshotChartEnabled, ref _isHeadshotChartEnabled, value); }
        }

        public bool IsCrouchKillChartEnabled
        {
            get { return _isCrouchKillChartEnabled; }
            set { Set(() => IsCrouchKillChartEnabled, ref _isCrouchKillChartEnabled, value); }
        }

        public bool IsVelocityRifleChartEnabled
        {
            get { return _isVelocityRifleChartEnabled; }
            set { Set(() => IsVelocityRifleChartEnabled, ref _isVelocityRifleChartEnabled, value); }
        }

        public bool IsVelocityPistolChartEnabled
        {
            get { return _isVelocityPistolChartEnabled; }
            set { Set(() => IsVelocityPistolChartEnabled, ref _isVelocityPistolChartEnabled, value); }
        }

        public bool IsVelocitySniperChartEnabled
        {
            get { return _isVelocitySniperChartEnabled; }
            set { Set(() => IsVelocitySniperChartEnabled, ref _isVelocitySniperChartEnabled, value); }
        }

        public bool IsVelocityHeavyChartEnabled
        {
            get { return _isVelocityHeavyChartEnabled; }
            set { Set(() => IsVelocityHeavyChartEnabled, ref _isVelocityHeavyChartEnabled, value); }
        }

        public bool IsVelocitySmgChartEnabled
        {
            get { return _isVelocitySmgChartEnabled; }
            set { Set(() => IsVelocitySmgChartEnabled, ref _isVelocitySmgChartEnabled, value); }
        }

        public double MaximumVelocity
        {
            get { return _maximumVelocity; }
            set { Set(() => MaximumVelocity, ref _maximumVelocity, value); }
        }

        public List<HeadshotDateChart> DatasHeadshot
        {
            get { return _datasHeadshot; }
            set { Set(() => DatasHeadshot, ref _datasHeadshot, value); }
        }

        public List<CrouchKillDateChart> DatasCrouchKill
        {
            get { return _datasCrouchKill; }
            set { Set(() => DatasCrouchKill, ref _datasCrouchKill, value); }
        }

        public List<WinDateChart> DatasWin
        {
            get { return _datasWin; }
            set { Set(() => DatasWin, ref _datasWin, value); }
        }

        public List<DamageDateChart> DatasDamage
        {
            get { return _datasDamage; }
            set { Set(() => DatasDamage, ref _datasDamage, value); }
        }

        public List<KillDateChart> DatasKill
        {
            get { return _datasKill; }
            set { Set(() => DatasKill, ref _datasKill, value); }
        }

        public List<KillVelocityChart> VelocityRifle
        {
            get { return _velocityRifle; }
            set { Set(() => VelocityRifle, ref _velocityRifle, value); }
        }

        public List<KillVelocityChart> VelocitySniper
        {
            get { return _velocitySniper; }
            set { Set(() => VelocitySniper, ref _velocitySniper, value); }
        }

        public List<KillVelocityChart> VelocityHeavy
        {
            get { return _velocityHeavy; }
            set { Set(() => VelocityHeavy, ref _velocityHeavy, value); }
        }

        public List<KillVelocityChart> VelocityPistol
        {
            get { return _velocityPistol; }
            set { Set(() => VelocityPistol, ref _velocityPistol, value); }
        }

        public List<KillVelocityChart> VelocitySmg
        {
            get { return _velocitySmg; }
            set { Set(() => VelocitySmg, ref _velocitySmg, value); }
        }

        public string DateFormat => Properties.Settings.Default.DateFormatEuropean ? "dd MMM yyyy" : "yyyy MMM dd";

        #endregion

        #region Commands

        public RelayCommand WindowLoaded
        {
            get
            {
                return _windowLoadedCommand
                       ?? (_windowLoadedCommand = new RelayCommand(
                           async () =>
                           {
                               await LoadDatas();
                               Messenger.Default.Register<SettingsFlyoutClosed>(this, HandleSettingsFlyoutClosedMessage);
                           }));
            }
        }

        /// <summary>
        /// Command when the checkbox to toggle win chart is clicked
        /// </summary>
        public RelayCommand<bool> ToggleWinChartCommand
        {
            get
            {
                return _toggleWinChartCommand
                       ?? (_toggleWinChartCommand = new RelayCommand<bool>(
                           isChecked => { IsWinChartEnabled = isChecked; },
                           isChecked => !IsBusy));
            }
        }

        /// <summary>
        /// Command when the checkbox to toggle damage chart is clicked
        /// </summary>
        public RelayCommand<bool> ToggleDamageChartCommand
        {
            get
            {
                return _toggleDamageChartCommand
                       ?? (_toggleDamageChartCommand = new RelayCommand<bool>(
                           isChecked => { IsDamageChartEnabled = isChecked; },
                           isChecked => !IsBusy));
            }
        }

        /// <summary>
        /// Command when the checkbox to toggle headshot chart is clicked
        /// </summary>
        public RelayCommand<bool> ToggleHeadshotChartCommand
        {
            get
            {
                return _toggleHeadshotChartCommand
                       ?? (_toggleHeadshotChartCommand = new RelayCommand<bool>(
                           isChecked => { IsHeadshotChartEnabled = isChecked; },
                           isChecked => !IsBusy));
            }
        }

        /// <summary>
        /// Command when the checkbox to toggle crouch kill % chart is clicked
        /// </summary>
        public RelayCommand<bool> ToggleCrouchKillChartCommand
        {
            get
            {
                return _toggleCrouchKillChartCommand
                       ?? (_toggleCrouchKillChartCommand = new RelayCommand<bool>(
                           isChecked => { IsCrouchKillChartEnabled = isChecked; },
                           isChecked => !IsBusy));
            }
        }

        /// <summary>
        /// Command when the checkbox to toggle kill velocity rifle chart is clicked
        /// </summary>
        public RelayCommand<bool> ToggleVelocityRifleChartCommand
        {
            get
            {
                return _toggleVelocityRifleChartCommand
                       ?? (_toggleVelocityRifleChartCommand = new RelayCommand<bool>(
                           isChecked => { IsVelocityRifleChartEnabled = isChecked; },
                           isChecked => !IsBusy));
            }
        }

        /// <summary>
        /// Command when the checkbox to toggle kill velocity sniper chart is clicked
        /// </summary>
        public RelayCommand<bool> ToggleVelocitySniperChartCommand
        {
            get
            {
                return _toggleVelocitySniperChartCommand
                       ?? (_toggleVelocitySniperChartCommand = new RelayCommand<bool>(
                           isChecked => { IsVelocitySniperChartEnabled = isChecked; },
                           isChecked => !IsBusy));
            }
        }

        /// <summary>
        /// Command when the checkbox to toggle kill velocity heavy chart is clicked
        /// </summary>
        public RelayCommand<bool> ToggleVelocityHeavyChartCommand
        {
            get
            {
                return _toggleVelocityHeavyChartCommand
                       ?? (_toggleVelocityHeavyChartCommand = new RelayCommand<bool>(
                           isChecked => { IsVelocityHeavyChartEnabled = isChecked; },
                           isChecked => !IsBusy));
            }
        }

        /// <summary>
        /// Command when the checkbox to toggle kill velocity pistol chart is clicked
        /// </summary>
        public RelayCommand<bool> ToggleVelocityPistolChartCommand
        {
            get
            {
                return _toggleVelocityPistolChartCommand
                       ?? (_toggleVelocityPistolChartCommand = new RelayCommand<bool>(
                           isChecked => { IsVelocityPistolChartEnabled = isChecked; },
                           isChecked => !IsBusy));
            }
        }

        /// <summary>
        /// Command when the checkbox to toggle kill velocity SMG chart is clicked
        /// </summary>
        public RelayCommand<bool> ToggleVelocitySmgChartCommand
        {
            get
            {
                return _toggleVelocitySmgChartCommand
                       ?? (_toggleVelocitySmgChartCommand = new RelayCommand<bool>(
                           isChecked => { IsVelocitySmgChartEnabled = isChecked; },
                           isChecked => !IsBusy));
            }
        }

        #endregion

        private async Task LoadDatas()
        {
            IsBusy = true;
            Notification = "Loading...";
            List<Demo> demos = await _cacheService.GetFilteredDemoListAsync();
            ProgressStats datas = await _accountStatsService.GetProgressStatsAsync(demos);
            DatasWin = datas.Win;
            DatasDamage = datas.Damage;
            DatasHeadshot = datas.HeadshotRatio;
            DatasKill = datas.Kill;
            VelocityRifle = datas.KillVelocityRifle;
            VelocityPistol = datas.KillVelocityPistol;
            VelocitySmg = datas.KillVelocitySmg;
            VelocitySniper = datas.KillVelocitySniper;
            VelocityHeavy = datas.KillVelocityHeavy;
            MaximumVelocity = datas.MaximumVelocity + 10;
            DatasCrouchKill = datas.CrouchKill;
            CommandManager.InvalidateRequerySuggested();
            IsBusy = false;
        }

        public AccountProgressViewModel(IAccountStatsService accountStatsService, ICacheService cacheService)
        {
            _accountStatsService = accountStatsService;
            _cacheService = cacheService;

            if (IsInDesignMode)
            {
                Application.Current.Dispatcher.Invoke(async () => { await LoadDatas(); });
            }
        }

        private void HandleSettingsFlyoutClosedMessage(SettingsFlyoutClosed msg)
        {
            DispatcherHelper.CheckBeginInvokeOnUI(
                async () => { await LoadDatas(); });
        }

        public override void Cleanup()
        {
            base.Cleanup();
            DatasDamage.Clear();
            DatasKill.Clear();
            DatasWin.Clear();
            DatasHeadshot.Clear();
            VelocityRifle.Clear();
            VelocityHeavy.Clear();
            VelocitySniper.Clear();
            VelocitySmg.Clear();
            VelocityPistol.Clear();
            MaximumVelocity = 250;
            DatasCrouchKill.Clear();
        }
    }
}
