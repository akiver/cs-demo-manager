using System.Collections.Generic;
using System.Threading.Tasks;
using System.Windows;
using Core.Models;
using GalaSoft.MvvmLight.CommandWpf;
using GalaSoft.MvvmLight.Messaging;
using GalaSoft.MvvmLight.Threading;
using Manager.Messages;
using Manager.ViewModel.Shared;
using Manager.Views.Accounts;
using Manager.Views.Demos;
using Services.Interfaces;
using Services.Models.Stats;
using Telerik.Charting;

namespace Manager.ViewModel.Accounts
{
    public class AccountWeaponsViewModel : BaseViewModel
    {
        #region Properties

        private readonly IAccountStatsService _accountStatsService;

        private readonly ICacheService _cacheService;

        private RelayCommand _windowLoadedCommand;

        private RelayCommand _goToOverallCommand;

        private RelayCommand _backToHomeCommand;

        private RelayCommand _goToRankCommand;

        private RelayCommand _goToMapCommand;

        private RelayCommand _goToProgressCommand;

        private readonly string _killsLabel = Properties.Resources.Kills;

        private readonly string _deathsLabel = Properties.Resources.Deaths;

        #region Rifles properties

        private List<CategoricalDataPoint> _datasAk47Kill;
        private List<CategoricalDataPoint> _datasAk47Death;
        private List<CategoricalDataPoint> _datasM4A4Kill;
        private List<CategoricalDataPoint> _datasM4A4Death;
        private List<CategoricalDataPoint> _datasM4A1Kill;
        private List<CategoricalDataPoint> _datasM4A1Death;
        private List<CategoricalDataPoint> _datasFamasKill;
        private List<CategoricalDataPoint> _datasFamasDeath;
        private List<CategoricalDataPoint> _datasAugKill;
        private List<CategoricalDataPoint> _datasAugDeath;
        private List<CategoricalDataPoint> _datasSg553Kill;
        private List<CategoricalDataPoint> _datasSg553Death;
        private List<CategoricalDataPoint> _datasGalilarKill;
        private List<CategoricalDataPoint> _datasGalilarDeath;

        #endregion

        #region Snipers properties

        private List<CategoricalDataPoint> _datasAwpKill;
        private List<CategoricalDataPoint> _datasAwpDeath;
        private List<CategoricalDataPoint> _datasScar20Kill;
        private List<CategoricalDataPoint> _datasScar20Death;
        private List<CategoricalDataPoint> _datasScoutKill;
        private List<CategoricalDataPoint> _datasScoutDeath;
        private List<CategoricalDataPoint> _datasG3Sg1Kill;
        private List<CategoricalDataPoint> _datasG3Sg1Death;

        #endregion

        #region SMGs properties

        private List<CategoricalDataPoint> _datasBizonKill;
        private List<CategoricalDataPoint> _datasBizonDeath;
        private List<CategoricalDataPoint> _datasMp7Kill;
        private List<CategoricalDataPoint> _datasMp7Death;
        private List<CategoricalDataPoint> _datasMp5Kill;
        private List<CategoricalDataPoint> _datasMp5Death;
        private List<CategoricalDataPoint> _datasMp9Kill;
        private List<CategoricalDataPoint> _datasMp9Death;
        private List<CategoricalDataPoint> _datasMac10Kill;
        private List<CategoricalDataPoint> _datasMac10Death;
        private List<CategoricalDataPoint> _datasP90Kill;
        private List<CategoricalDataPoint> _datasP90Death;
        private List<CategoricalDataPoint> _datasUmp45Kill;
        private List<CategoricalDataPoint> _datasUmp45Death;

        #endregion

        #region Heavy properties

        private List<CategoricalDataPoint> _datasNovaKill;
        private List<CategoricalDataPoint> _datasNovaDeath;
        private List<CategoricalDataPoint> _datasXm1014Kill;
        private List<CategoricalDataPoint> _datasXm1014Death;
        private List<CategoricalDataPoint> _datasSawedOffKill;
        private List<CategoricalDataPoint> _datasSawedOffDeath;
        private List<CategoricalDataPoint> _datasMag7Kill;
        private List<CategoricalDataPoint> _datasMag7Death;
        private List<CategoricalDataPoint> _datasM249Kill;
        private List<CategoricalDataPoint> _datasM249Death;
        private List<CategoricalDataPoint> _datasNegevKill;
        private List<CategoricalDataPoint> _datasNegevDeath;

        #endregion

        #region Pistols properties

        private List<CategoricalDataPoint> _datasGlockKill;
        private List<CategoricalDataPoint> _datasGlockDeath;
        private List<CategoricalDataPoint> _datasUspKill;
        private List<CategoricalDataPoint> _datasUspDeath;
        private List<CategoricalDataPoint> _datasP2000Kill;
        private List<CategoricalDataPoint> _datasP2000Death;
        private List<CategoricalDataPoint> _datasTec9Kill;
        private List<CategoricalDataPoint> _datasTec9Death;
        private List<CategoricalDataPoint> _datasCz75Kill;
        private List<CategoricalDataPoint> _datasCz75Death;
        private List<CategoricalDataPoint> _datasDualEliteKill;
        private List<CategoricalDataPoint> _datasDualEliteDeath;
        private List<CategoricalDataPoint> _datasDeagleKill;
        private List<CategoricalDataPoint> _datasDeagleDeath;
        private List<CategoricalDataPoint> _datasFiveSevenKill;
        private List<CategoricalDataPoint> _datasFiveSevenDeath;
        private List<CategoricalDataPoint> _datasP250Kill;
        private List<CategoricalDataPoint> _datasP250Death;

        #endregion

        #region Equipment properties

        private List<CategoricalDataPoint> _datasheGrenadeKill;
        private List<CategoricalDataPoint> _datasheGrenadeDeath;
        private List<CategoricalDataPoint> _datasMolotovKill;
        private List<CategoricalDataPoint> _datasMolotovDeath;
        private List<CategoricalDataPoint> _datasIncendiaryKill;
        private List<CategoricalDataPoint> _datasIncendiaryDeath;
        private List<CategoricalDataPoint> _datasTazerKill;
        private List<CategoricalDataPoint> _datasTazerDeath;
        private List<CategoricalDataPoint> _datasKnifeKill;
        private List<CategoricalDataPoint> _datasKnifeDeath;
        private int _decoyThrownCount;
        private int _smokeThrownCount;
        private int _flashbangThrownCount;
        private int _heGrenadeThrownCount;
        private int _molotovThrownCount;
        private int _incendiaryThrownCount;

        #endregion

        #endregion

        #region Accessors

        #region Rifles accessors

        public List<CategoricalDataPoint> DatasAk47Kill
        {
            get { return _datasAk47Kill; }
            set { Set(() => DatasAk47Kill, ref _datasAk47Kill, value); }
        }

        public List<CategoricalDataPoint> DatasAk47Death
        {
            get { return _datasAk47Death; }
            set { Set(() => DatasAk47Death, ref _datasAk47Death, value); }
        }

        public List<CategoricalDataPoint> DatasM4A4Kill
        {
            get { return _datasM4A4Kill; }
            set { Set(() => DatasM4A4Kill, ref _datasM4A4Kill, value); }
        }

        public List<CategoricalDataPoint> DatasM4A4Death
        {
            get { return _datasM4A4Death; }
            set { Set(() => DatasM4A4Death, ref _datasM4A4Death, value); }
        }

        public List<CategoricalDataPoint> DatasM4A1Kill
        {
            get { return _datasM4A1Kill; }
            set { Set(() => DatasM4A1Kill, ref _datasM4A1Kill, value); }
        }

        public List<CategoricalDataPoint> DatasM4A1Death
        {
            get { return _datasM4A1Death; }
            set { Set(() => DatasM4A1Death, ref _datasM4A1Death, value); }
        }

        public List<CategoricalDataPoint> DatasFamasKill
        {
            get { return _datasFamasKill; }
            set { Set(() => DatasFamasKill, ref _datasFamasKill, value); }
        }

        public List<CategoricalDataPoint> DatasFamasDeath
        {
            get { return _datasFamasDeath; }
            set { Set(() => DatasFamasDeath, ref _datasFamasDeath, value); }
        }

        public List<CategoricalDataPoint> DatasAugKill
        {
            get { return _datasAugKill; }
            set { Set(() => DatasAugKill, ref _datasAugKill, value); }
        }

        public List<CategoricalDataPoint> DatasAugDeath
        {
            get { return _datasAugDeath; }
            set { Set(() => DatasAugDeath, ref _datasAugDeath, value); }
        }

        public List<CategoricalDataPoint> DatasGalilarKill
        {
            get { return _datasGalilarKill; }
            set { Set(() => DatasGalilarKill, ref _datasGalilarKill, value); }
        }

        public List<CategoricalDataPoint> DatasGalilarDeath
        {
            get { return _datasGalilarDeath; }
            set { Set(() => DatasGalilarDeath, ref _datasGalilarDeath, value); }
        }

        public List<CategoricalDataPoint> DatasSg553Kill
        {
            get { return _datasSg553Kill; }
            set { Set(() => DatasSg553Kill, ref _datasSg553Kill, value); }
        }

        public List<CategoricalDataPoint> DatasSg553Death
        {
            get { return _datasSg553Death; }
            set { Set(() => DatasSg553Death, ref _datasSg553Death, value); }
        }

        #endregion

        #region Snipers accessors

        public List<CategoricalDataPoint> DatasAwpKill
        {
            get { return _datasAwpKill; }
            set { Set(() => DatasAwpKill, ref _datasAwpKill, value); }
        }

        public List<CategoricalDataPoint> DatasAwpDeath
        {
            get { return _datasAwpDeath; }
            set { Set(() => DatasAwpDeath, ref _datasAwpDeath, value); }
        }

        public List<CategoricalDataPoint> DatasScoutKill
        {
            get { return _datasScoutKill; }
            set { Set(() => DatasScoutKill, ref _datasScoutKill, value); }
        }

        public List<CategoricalDataPoint> DatasScoutDeath
        {
            get { return _datasScoutDeath; }
            set { Set(() => DatasScoutDeath, ref _datasScoutDeath, value); }
        }

        public List<CategoricalDataPoint> DatasScar20Kill
        {
            get { return _datasScar20Kill; }
            set { Set(() => DatasScar20Kill, ref _datasScar20Kill, value); }
        }

        public List<CategoricalDataPoint> DatasScar20Death
        {
            get { return _datasScar20Death; }
            set { Set(() => DatasScar20Death, ref _datasScar20Death, value); }
        }

        public List<CategoricalDataPoint> DatasG3Sg1Kill
        {
            get { return _datasG3Sg1Kill; }
            set { Set(() => DatasG3Sg1Kill, ref _datasG3Sg1Kill, value); }
        }

        public List<CategoricalDataPoint> DatasG3Sg1Death
        {
            get { return _datasG3Sg1Death; }
            set { Set(() => DatasG3Sg1Death, ref _datasG3Sg1Death, value); }
        }

        #endregion

        #region SMGs accessors

        public List<CategoricalDataPoint> DatasMp7Kill
        {
            get { return _datasMp7Kill; }
            set { Set(() => DatasMp7Kill, ref _datasMp7Kill, value); }
        }

        public List<CategoricalDataPoint> DatasMp7Death
        {
            get { return _datasMp7Death; }
            set { Set(() => DatasMp7Death, ref _datasMp7Death, value); }
        }

        public List<CategoricalDataPoint> DatasMp5Kill
        {
            get { return _datasMp5Kill; }
            set { Set(() => DatasMp5Kill, ref _datasMp5Kill, value); }
        }

        public List<CategoricalDataPoint> DatasMp5Death
        {
            get { return _datasMp5Death; }
            set { Set(() => DatasMp5Death, ref _datasMp5Death, value); }
        }

        public List<CategoricalDataPoint> DatasMp9Kill
        {
            get { return _datasMp9Kill; }
            set { Set(() => DatasMp9Kill, ref _datasMp9Kill, value); }
        }

        public List<CategoricalDataPoint> DatasMp9Death
        {
            get { return _datasMp9Death; }
            set { Set(() => DatasMp9Death, ref _datasMp9Death, value); }
        }

        public List<CategoricalDataPoint> DatasP90Kill
        {
            get { return _datasP90Kill; }
            set { Set(() => DatasP90Kill, ref _datasP90Kill, value); }
        }

        public List<CategoricalDataPoint> DatasP90Death
        {
            get { return _datasP90Death; }
            set { Set(() => DatasP90Death, ref _datasP90Death, value); }
        }

        public List<CategoricalDataPoint> DatasBizonKill
        {
            get { return _datasBizonKill; }
            set { Set(() => DatasBizonKill, ref _datasBizonKill, value); }
        }

        public List<CategoricalDataPoint> DatasBizonDeath
        {
            get { return _datasBizonDeath; }
            set { Set(() => DatasBizonDeath, ref _datasBizonDeath, value); }
        }

        public List<CategoricalDataPoint> DatasMac10Kill
        {
            get { return _datasMac10Kill; }
            set { Set(() => DatasMac10Kill, ref _datasMac10Kill, value); }
        }

        public List<CategoricalDataPoint> DatasMac10Death
        {
            get { return _datasMac10Death; }
            set { Set(() => DatasMac10Death, ref _datasMac10Death, value); }
        }

        public List<CategoricalDataPoint> DatasUmp45Kill
        {
            get { return _datasUmp45Kill; }
            set { Set(() => DatasUmp45Kill, ref _datasUmp45Kill, value); }
        }

        public List<CategoricalDataPoint> DatasUmp45Death
        {
            get { return _datasUmp45Death; }
            set { Set(() => DatasUmp45Death, ref _datasUmp45Death, value); }
        }

        #endregion

        #region Heavy accessors

        public List<CategoricalDataPoint> DatasNovaKill
        {
            get { return _datasNovaKill; }
            set { Set(() => DatasNovaKill, ref _datasNovaKill, value); }
        }

        public List<CategoricalDataPoint> DatasNovaDeath
        {
            get { return _datasNovaDeath; }
            set { Set(() => DatasNovaDeath, ref _datasNovaDeath, value); }
        }

        public List<CategoricalDataPoint> DatasXm1014Kill
        {
            get { return _datasXm1014Kill; }
            set { Set(() => DatasXm1014Kill, ref _datasXm1014Kill, value); }
        }

        public List<CategoricalDataPoint> DatasXm1014Death
        {
            get { return _datasXm1014Death; }
            set { Set(() => DatasXm1014Death, ref _datasXm1014Death, value); }
        }

        public List<CategoricalDataPoint> DatasMag7Kill
        {
            get { return _datasMag7Kill; }
            set { Set(() => DatasMag7Kill, ref _datasMag7Kill, value); }
        }

        public List<CategoricalDataPoint> DatasMag7Death
        {
            get { return _datasMag7Death; }
            set { Set(() => DatasMag7Death, ref _datasMag7Death, value); }
        }

        public List<CategoricalDataPoint> DatasSawedOffKill
        {
            get { return _datasSawedOffKill; }
            set { Set(() => DatasSawedOffKill, ref _datasSawedOffKill, value); }
        }

        public List<CategoricalDataPoint> DatasSawedOffDeath
        {
            get { return _datasSawedOffDeath; }
            set { Set(() => DatasSawedOffDeath, ref _datasSawedOffDeath, value); }
        }

        public List<CategoricalDataPoint> DatasM249Kill
        {
            get { return _datasM249Kill; }
            set { Set(() => DatasM249Kill, ref _datasM249Kill, value); }
        }

        public List<CategoricalDataPoint> DatasM249Death
        {
            get { return _datasM249Death; }
            set { Set(() => DatasM249Death, ref _datasM249Death, value); }
        }

        public List<CategoricalDataPoint> DatasNegevKill
        {
            get { return _datasNegevKill; }
            set { Set(() => DatasNegevKill, ref _datasNegevKill, value); }
        }

        public List<CategoricalDataPoint> DatasNegevDeath
        {
            get { return _datasNegevDeath; }
            set { Set(() => DatasNegevDeath, ref _datasNegevDeath, value); }
        }

        #endregion

        #region Pistols accessors

        public List<CategoricalDataPoint> DatasGlockKill
        {
            get { return _datasGlockKill; }
            set { Set(() => DatasGlockKill, ref _datasGlockKill, value); }
        }

        public List<CategoricalDataPoint> DatasGlockDeath
        {
            get { return _datasGlockDeath; }
            set { Set(() => DatasGlockDeath, ref _datasGlockDeath, value); }
        }

        public List<CategoricalDataPoint> DatasUspKill
        {
            get { return _datasUspKill; }
            set { Set(() => DatasUspKill, ref _datasUspKill, value); }
        }

        public List<CategoricalDataPoint> DatasUspDeath
        {
            get { return _datasUspDeath; }
            set { Set(() => DatasUspDeath, ref _datasUspDeath, value); }
        }

        public List<CategoricalDataPoint> DatasP2000Kill
        {
            get { return _datasP2000Kill; }
            set { Set(() => DatasP2000Kill, ref _datasP2000Kill, value); }
        }

        public List<CategoricalDataPoint> DatasP2000Death
        {
            get { return _datasP2000Death; }
            set { Set(() => DatasP2000Death, ref _datasP2000Death, value); }
        }

        public List<CategoricalDataPoint> DatasTec9Kill
        {
            get { return _datasTec9Kill; }
            set { Set(() => DatasTec9Kill, ref _datasTec9Kill, value); }
        }

        public List<CategoricalDataPoint> DatasTec9Death
        {
            get { return _datasTec9Death; }
            set { Set(() => DatasTec9Death, ref _datasTec9Death, value); }
        }

        public List<CategoricalDataPoint> DatasDualEliteKill
        {
            get { return _datasDualEliteKill; }
            set { Set(() => DatasDualEliteKill, ref _datasDualEliteKill, value); }
        }

        public List<CategoricalDataPoint> DatasDualEliteDeath
        {
            get { return _datasDualEliteDeath; }
            set { Set(() => DatasDualEliteDeath, ref _datasDualEliteDeath, value); }
        }

        public List<CategoricalDataPoint> DatasP250Kill
        {
            get { return _datasP250Kill; }
            set { Set(() => DatasP250Kill, ref _datasP250Kill, value); }
        }

        public List<CategoricalDataPoint> DatasP250Death
        {
            get { return _datasP250Death; }
            set { Set(() => DatasP250Death, ref _datasP250Death, value); }
        }

        public List<CategoricalDataPoint> DatasFiveSevenKill
        {
            get { return _datasFiveSevenKill; }
            set { Set(() => DatasFiveSevenKill, ref _datasFiveSevenKill, value); }
        }

        public List<CategoricalDataPoint> DatasFiveSevenDeath
        {
            get { return _datasFiveSevenDeath; }
            set { Set(() => DatasFiveSevenDeath, ref _datasFiveSevenDeath, value); }
        }

        public List<CategoricalDataPoint> DatasDeagleKill
        {
            get { return _datasDeagleKill; }
            set { Set(() => DatasDeagleKill, ref _datasDeagleKill, value); }
        }

        public List<CategoricalDataPoint> DatasDeagleDeath
        {
            get { return _datasDeagleDeath; }
            set { Set(() => DatasDeagleDeath, ref _datasDeagleDeath, value); }
        }

        public List<CategoricalDataPoint> DatasCz75Kill
        {
            get { return _datasCz75Kill; }
            set { Set(() => DatasCz75Kill, ref _datasCz75Kill, value); }
        }

        public List<CategoricalDataPoint> DatasCz75Death
        {
            get { return _datasCz75Death; }
            set { Set(() => DatasCz75Death, ref _datasCz75Death, value); }
        }

        #endregion

        #region Equipment Accessors

        public List<CategoricalDataPoint> DatasHeGrenadeKill
        {
            get { return _datasheGrenadeKill; }
            set { Set(() => DatasHeGrenadeKill, ref _datasheGrenadeKill, value); }
        }

        public List<CategoricalDataPoint> DatasHeGrenadeDeath
        {
            get { return _datasheGrenadeDeath; }
            set { Set(() => DatasHeGrenadeDeath, ref _datasheGrenadeDeath, value); }
        }

        public List<CategoricalDataPoint> DatasMolotovKill
        {
            get { return _datasMolotovKill; }
            set { Set(() => DatasMolotovKill, ref _datasMolotovKill, value); }
        }

        public List<CategoricalDataPoint> DatasMolotovDeath
        {
            get { return _datasMolotovDeath; }
            set { Set(() => DatasMolotovDeath, ref _datasMolotovDeath, value); }
        }

        public List<CategoricalDataPoint> DatasIncendiaryKill
        {
            get { return _datasIncendiaryKill; }
            set { Set(() => DatasIncendiaryKill, ref _datasIncendiaryKill, value); }
        }

        public List<CategoricalDataPoint> DatasIncendiaryDeath
        {
            get { return _datasIncendiaryDeath; }
            set { Set(() => DatasIncendiaryDeath, ref _datasIncendiaryDeath, value); }
        }

        public List<CategoricalDataPoint> DatasTazerKill
        {
            get { return _datasTazerKill; }
            set { Set(() => DatasTazerKill, ref _datasTazerKill, value); }
        }

        public List<CategoricalDataPoint> DatasTazerDeath
        {
            get { return _datasTazerDeath; }
            set { Set(() => DatasTazerDeath, ref _datasTazerDeath, value); }
        }

        public List<CategoricalDataPoint> DatasKnifeKill
        {
            get { return _datasKnifeKill; }
            set { Set(() => DatasKnifeKill, ref _datasKnifeKill, value); }
        }

        public List<CategoricalDataPoint> DatasKnifeDeath
        {
            get { return _datasKnifeDeath; }
            set { Set(() => DatasKnifeDeath, ref _datasKnifeDeath, value); }
        }

        public int DecoyThrownCount
        {
            get { return _decoyThrownCount; }
            set { Set(() => DecoyThrownCount, ref _decoyThrownCount, value); }
        }

        public int FlashbangThrownCount
        {
            get { return _flashbangThrownCount; }
            set { Set(() => FlashbangThrownCount, ref _flashbangThrownCount, value); }
        }

        public int SmokeThrownCount
        {
            get { return _smokeThrownCount; }
            set { Set(() => SmokeThrownCount, ref _smokeThrownCount, value); }
        }

        public int HeGrenadeThrownCount
        {
            get { return _heGrenadeThrownCount; }
            set { Set(() => HeGrenadeThrownCount, ref _heGrenadeThrownCount, value); }
        }

        public int MolotovThrownCount
        {
            get { return _molotovThrownCount; }
            set { Set(() => MolotovThrownCount, ref _molotovThrownCount, value); }
        }

        public int IncendiaryThrownCount
        {
            get { return _incendiaryThrownCount; }
            set { Set(() => IncendiaryThrownCount, ref _incendiaryThrownCount, value); }
        }

        #endregion

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
        /// Command to go to the overall stats page
        /// </summary>
        public RelayCommand GoToOverallCommand
        {
            get
            {
                return _goToOverallCommand
                       ?? (_goToOverallCommand = new RelayCommand(
                           () =>
                           {
                               var mainViewModel = new ViewModelLocator().Main;
                               Application.Current.Properties["LastPageViewed"] = mainViewModel.CurrentPage.CurrentPage;
                               AccountOverallView overallView = new AccountOverallView();
                               mainViewModel.CurrentPage.ShowPage(overallView);
                               Cleanup();
                           }));
            }
        }

        /// <summary>
        /// Command to back to the home page
        /// </summary>
        public RelayCommand BackToHomeCommand
        {
            get
            {
                return _backToHomeCommand
                       ?? (_backToHomeCommand = new RelayCommand(
                           () =>
                           {
                               var mainViewModel = new ViewModelLocator().Main;
                               Application.Current.Properties["LastPageViewed"] = mainViewModel.CurrentPage.CurrentPage;
                               DemoListView demoListView = new DemoListView();
                               mainViewModel.CurrentPage.ShowPage(demoListView);
                               Cleanup();
                           }));
            }
        }

        /// <summary>
        /// Command to go to the rank stats page
        /// </summary>
        public RelayCommand GoToRankCommand
        {
            get
            {
                return _goToRankCommand
                       ?? (_goToRankCommand = new RelayCommand(
                           () =>
                           {
                               var mainViewModel = new ViewModelLocator().Main;
                               Application.Current.Properties["LastPageViewed"] = mainViewModel.CurrentPage.CurrentPage;
                               AccountRankView rankView = new AccountRankView();
                               mainViewModel.CurrentPage.ShowPage(rankView);
                               Cleanup();
                           }));
            }
        }

        /// <summary>
        /// Command to go to the maps stats page
        /// </summary>
        public RelayCommand GoToMapCommand
        {
            get
            {
                return _goToMapCommand
                       ?? (_goToMapCommand = new RelayCommand(
                           () =>
                           {
                               var mainViewModel = new ViewModelLocator().Main;
                               Application.Current.Properties["LastPageViewed"] = mainViewModel.CurrentPage.CurrentPage;
                               AccountMapsView mapsView = new AccountMapsView();
                               mainViewModel.CurrentPage.ShowPage(mapsView);
                               Cleanup();
                           }));
            }
        }

        /// <summary>
        /// Command to go to the progression stats page
        /// </summary>
        public RelayCommand GoToProgressCommand
        {
            get
            {
                return _goToProgressCommand
                       ?? (_goToProgressCommand = new RelayCommand(
                           () =>
                           {
                               var mainViewModel = new ViewModelLocator().Main;
                               Application.Current.Properties["LastPageViewed"] = mainViewModel.CurrentPage.CurrentPage;
                               AccountProgressView progressView = new AccountProgressView();
                               mainViewModel.CurrentPage.ShowPage(progressView);
                               Cleanup();
                           }));
            }
        }

        #endregion

        private async Task LoadDatas()
        {
            IsBusy = true;
            Notification = Properties.Resources.NotificationLoading;
            List<Demo> demos = await _cacheService.GetFilteredDemoListAsync();
            WeaponStats datas = await _accountStatsService.GetWeaponStatsAsync(demos);

            DatasAk47Kill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.AK_47,
                    Value = datas.KillAk47Count,
                    Label = _killsLabel,
                },
            };

            DatasAk47Death = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.AK_47,
                    Value = datas.DeathAk47Count,
                    Label = _deathsLabel,
                },
            };

            DatasM4A4Kill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.M4A4,
                    Value = datas.KillM4A4Count,
                    Label = _killsLabel,
                },
            };

            DatasM4A4Death = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.M4A4,
                    Value = datas.DeathM4A4Count,
                    Label = _deathsLabel,
                },
            };

            DatasM4A1Kill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.M4A1_S,
                    Value = datas.KillM4A1Count,
                    Label = _killsLabel,
                },
            };

            DatasM4A1Death = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.M4A1_S,
                    Value = datas.DeathM4A1Count,
                    Label = _deathsLabel,
                },
            };

            DatasAugKill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.AUG,
                    Value = datas.KillAugCount,
                    Label = _killsLabel,
                },
            };

            DatasAugDeath = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.AUG,
                    Value = datas.DeathAugCount,
                    Label = _deathsLabel,
                },
            };

            DatasGalilarKill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.GALIL,
                    Value = datas.KillGalilarCount,
                    Label = _killsLabel,
                },
            };

            DatasGalilarDeath = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.GALIL,
                    Value = datas.DeathGalilarCount,
                    Label = _deathsLabel,
                },
            };

            DatasSg553Kill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.SG_553,
                    Value = datas.KillSg553Count,
                    Label = _killsLabel,
                },
            };

            DatasSg553Death = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.SG_553,
                    Value = datas.DeathSg553Count,
                    Label = _deathsLabel,
                },
            };

            DatasFamasKill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.FAMAS,
                    Value = datas.KillFamasCount,
                    Label = _killsLabel,
                },
            };

            DatasFamasDeath = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.FAMAS,
                    Value = datas.DeathFamasCount,
                    Label = _deathsLabel,
                },
            };

            // Snipers
            DatasAwpKill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.AWP,
                    Value = datas.KillAwpCount,
                    Label = _killsLabel,
                },
            };

            DatasAwpDeath = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.AWP,
                    Value = datas.DeathAwpCount,
                    Label = _deathsLabel,
                },
            };

            DatasScar20Kill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.SCAR_20,
                    Value = datas.KillScar20Count,
                    Label = _killsLabel,
                },
            };

            DatasScar20Death = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.SCAR_20,
                    Value = datas.DeathScar20Count,
                    Label = _deathsLabel,
                },
            };

            DatasG3Sg1Kill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.G3SG1,
                    Value = datas.KillG3Sg1Count,
                    Label = _killsLabel,
                },
            };

            DatasG3Sg1Death = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.G3SG1,
                    Value = datas.DeathG3Ssg1Count,
                    Label = _deathsLabel,
                },
            };

            DatasScoutKill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.SSG_08,
                    Value = datas.KillScoutCount,
                    Label = _killsLabel,
                },
            };

            DatasScoutDeath = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.SSG_08,
                    Value = datas.DeathScoutCount,
                    Label = _deathsLabel,
                },
            };

            // SMGs
            DatasMp7Kill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.MP7,
                    Value = datas.KillMp7Count,
                    Label = _killsLabel,
                },
            };

            DatasMp7Death = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.MP7,
                    Value = datas.DeathMp7Count,
                    Label = _deathsLabel,
                },
            };

            DatasMp5Kill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.MP5SD,
                    Value = datas.KillMp5Count,
                    Label = _killsLabel,
                },
            };

            DatasMp5Death = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.MP5SD,
                    Value = datas.DeathMp5Count,
                    Label = _deathsLabel,
                },
            };

            DatasMp9Kill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.MP9,
                    Value = datas.KillMp9Count,
                    Label = _killsLabel,
                },
            };

            DatasMp9Death = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.MP9,
                    Value = datas.DeathMp9Count,
                    Label = _deathsLabel,
                },
            };

            DatasP90Kill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.P90,
                    Value = datas.KillP90Count,
                    Label = _killsLabel,
                },
            };

            DatasP90Death = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.P90,
                    Value = datas.DeathP90Count,
                    Label = _deathsLabel,
                },
            };

            DatasBizonKill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.PP_BIZON,
                    Value = datas.KillBizonCount,
                    Label = _killsLabel,
                },
            };

            DatasBizonDeath = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.PP_BIZON,
                    Value = datas.DeathBizonCount,
                    Label = _deathsLabel,
                },
            };

            DatasMac10Kill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.MAC_10,
                    Value = datas.KillMac10Count,
                    Label = _killsLabel,
                },
            };

            DatasMac10Death = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.MAC_10,
                    Value = datas.DeathMac10Count,
                    Label = _deathsLabel,
                },
            };

            DatasUmp45Kill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.UMP_45,
                    Value = datas.KillUmp45Count,
                    Label = _killsLabel,
                },
            };

            DatasUmp45Death = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.UMP_45,
                    Value = datas.DeathUmp45Count,
                    Label = _deathsLabel,
                },
            };

            // Heavy
            DatasNovaKill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.NOVA,
                    Value = datas.KillNovaCount,
                    Label = _killsLabel,
                },
            };

            DatasNovaDeath = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.NOVA,
                    Value = datas.DeathNovaCount,
                    Label = _deathsLabel,
                },
            };

            DatasXm1014Kill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.XM1014,
                    Value = datas.KillXm1014Count,
                    Label = _killsLabel,
                },
            };

            DatasXm1014Death = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.XM1014,
                    Value = datas.DeathXm1014Count,
                    Label = _deathsLabel,
                },
            };

            DatasMag7Kill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.MAG_7,
                    Value = datas.KillMag7Count,
                    Label = _killsLabel,
                },
            };

            DatasMag7Death = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.MAG_7,
                    Value = datas.DeathMag7Count,
                    Label = _deathsLabel,
                },
            };

            DatasSawedOffKill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.SAWED_OFF,
                    Value = datas.KillSawedOffCount,
                    Label = _killsLabel,
                },
            };

            DatasSawedOffDeath = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.SAWED_OFF,
                    Value = datas.DeathSawedOffCount,
                    Label = _deathsLabel,
                },
            };

            DatasM249Kill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.M249,
                    Value = datas.KillM249Count,
                    Label = _killsLabel,
                },
            };

            DatasM249Death = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.M249,
                    Value = datas.DeathM249Count,
                    Label = _deathsLabel,
                },
            };

            DatasNegevKill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.NEGEV,
                    Value = datas.KillNegevCount,
                    Label = _killsLabel,
                },
            };

            DatasNegevDeath = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.NEGEV,
                    Value = datas.DeathNegevCount,
                    Label = _deathsLabel,
                },
            };

            // Pistols
            DatasGlockKill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.GLOCK,
                    Value = datas.KillGlockCount,
                    Label = _killsLabel,
                },
            };

            DatasGlockDeath = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.GLOCK,
                    Value = datas.DeathGlockCount,
                    Label = _deathsLabel,
                },
            };

            DatasUspKill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.USP,
                    Value = datas.KillUspCount,
                    Label = _killsLabel,
                },
            };

            DatasUspDeath = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.USP,
                    Value = datas.DeathUspCount,
                    Label = _deathsLabel,
                },
            };

            DatasP2000Kill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.P2000,
                    Value = datas.KillP2000Count,
                    Label = _killsLabel,
                },
            };

            DatasP2000Death = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.P2000,
                    Value = datas.DeathP2000Count,
                    Label = _deathsLabel,
                },
            };

            DatasP250Kill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.P250,
                    Value = datas.KillP250Count,
                    Label = _killsLabel,
                },
            };

            DatasP250Death = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.P250,
                    Value = datas.DeathP250Count,
                    Label = _deathsLabel,
                },
            };

            DatasTec9Kill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.TEC_9,
                    Value = datas.KillTec9Count,
                    Label = _killsLabel,
                },
            };

            DatasTec9Death = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.TEC_9,
                    Value = datas.DeathTec9Count,
                    Label = _deathsLabel,
                },
            };

            DatasDeagleKill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.DEAGLE,
                    Value = datas.KillDeagleCount,
                    Label = _killsLabel,
                },
            };

            DatasDeagleDeath = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.DEAGLE,
                    Value = datas.DeathDeagleCount,
                    Label = _deathsLabel,
                },
            };

            DatasFiveSevenKill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.FIVE_SEVEN,
                    Value = datas.KillFiveSevenCount,
                    Label = _killsLabel,
                },
            };

            DatasFiveSevenDeath = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.FIVE_SEVEN,
                    Value = datas.DeathFiveSevenCount,
                    Label = _deathsLabel,
                },
            };

            DatasDualEliteKill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.DUAL_BERETTAS,
                    Value = datas.KillDualEliteCount,
                    Label = _killsLabel,
                },
            };

            DatasDualEliteDeath = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.DUAL_BERETTAS,
                    Value = datas.DeathDualEliteCount,
                    Label = _deathsLabel,
                },
            };

            DatasCz75Kill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.CZ75,
                    Value = datas.KillCz75Count,
                    Label = _killsLabel,
                },
            };

            DatasCz75Death = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.CZ75,
                    Value = datas.DeathCz75Count,
                    Label = _deathsLabel,
                },
            };

            // Equipement
            DatasHeGrenadeKill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.HE,
                    Value = datas.KillHeGrenadeCount,
                    Label = _killsLabel,
                },
            };

            DatasHeGrenadeDeath = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.HE,
                    Value = datas.DeathHeGrenadeCount,
                    Label = _deathsLabel,
                },
            };

            DatasMolotovKill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.MOLOTOV,
                    Value = datas.KillMolotovCount,
                    Label = _killsLabel,
                },
            };

            DatasMolotovDeath = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.MOLOTOV,
                    Value = datas.DeathMolotovCount,
                    Label = _deathsLabel,
                },
            };

            DatasIncendiaryKill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.INCENDIARY,
                    Value = datas.KillIncendiaryCount,
                    Label = _killsLabel,
                },
            };

            DatasIncendiaryDeath = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.INCENDIARY,
                    Value = datas.DeathIncendiaryCount,
                    Label = _deathsLabel,
                },
            };

            DatasTazerKill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.ZEUS,
                    Value = datas.KillTazerCount,
                    Label = _killsLabel,
                },
            };

            DatasTazerDeath = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.ZEUS,
                    Value = datas.DeathTazerCount,
                    Label = _deathsLabel,
                },
            };

            DatasKnifeKill = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.KNIFE,
                    Value = datas.KillKnifeCount,
                    Label = _killsLabel,
                },
            };

            DatasKnifeDeath = new List<CategoricalDataPoint>
            {
                new CategoricalDataPoint
                {
                    Category = Weapon.KNIFE,
                    Value = datas.DeathKnifeCount,
                    Label = _deathsLabel,
                },
            };

            SmokeThrownCount = datas.SmokeThrownCount;
            DecoyThrownCount = datas.DecoyThrownCount;
            FlashbangThrownCount = datas.FlashbangThrownCount;
            HeGrenadeThrownCount = datas.HeGrenadeThrownCount;
            MolotovThrownCount = datas.MolotovThrownCount;
            IncendiaryThrownCount = datas.IncendiaryThrownCount;
            IsBusy = false;
        }

        public AccountWeaponsViewModel(IAccountStatsService accountStatsService, ICacheService cacheService)
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
            HeGrenadeThrownCount = 0;
            IncendiaryThrownCount = 0;
            MolotovThrownCount = 0;
            DecoyThrownCount = 0;
            SmokeThrownCount = 0;
            FlashbangThrownCount = 0;
            DatasAk47Kill = null;
            DatasAk47Death = null;
            DatasM249Kill = null;
            DatasM249Death = null;
            DatasAugKill = null;
            DatasAugDeath = null;
            DatasAwpKill = null;
            DatasAwpDeath = null;
            DatasBizonKill = null;
            DatasBizonDeath = null;
            DatasCz75Kill = null;
            DatasCz75Death = null;
            DatasDeagleKill = null;
            DatasDeagleDeath = null;
            DatasDualEliteKill = null;
            DatasDualEliteDeath = null;
            DatasFamasKill = null;
            DatasFamasDeath = null;
            DatasFiveSevenKill = null;
            DatasFiveSevenDeath = null;
            DatasG3Sg1Kill = null;
            DatasG3Sg1Death = null;
            DatasGalilarKill = null;
            DatasGalilarDeath = null;
            DatasGlockKill = null;
            DatasGlockDeath = null;
            DatasHeGrenadeKill = null;
            DatasHeGrenadeDeath = null;
            DatasIncendiaryKill = null;
            DatasIncendiaryDeath = null;
            DatasKnifeKill = null;
            DatasKnifeDeath = null;
            DatasM4A1Kill = null;
            DatasM4A1Death = null;
            DatasM4A4Kill = null;
            DatasM4A4Death = null;
            DatasMp7Kill = null;
            DatasMp7Death = null;
            DatasMp5Kill = null;
            DatasMp5Death = null;
            DatasMp9Kill = null;
            DatasMp9Death = null;
            DatasP250Kill = null;
            DatasP250Death = null;
            DatasP2000Kill = null;
            DatasP2000Death = null;
            DatasP90Kill = null;
            DatasP90Death = null;
            DatasUspKill = null;
            DatasUspDeath = null;
            DatasUmp45Kill = null;
            DatasUmp45Death = null;
            DatasSg553Kill = null;
            DatasSg553Death = null;
            DatasNegevKill = null;
            DatasNegevDeath = null;
            DatasMac10Kill = null;
            DatasMac10Death = null;
            DatasNovaKill = null;
            DatasNovaDeath = null;
            DatasMag7Kill = null;
            DatasMag7Death = null;
            DatasXm1014Kill = null;
            DatasXm1014Death = null;
            DatasTazerKill = null;
            DatasTazerDeath = null;
            DatasTec9Kill = null;
            DatasTec9Death = null;
            DatasMolotovKill = null;
            DatasMolotovDeath = null;
            DatasSawedOffKill = null;
            DatasSawedOffDeath = null;
            DatasScar20Kill = null;
            DatasScar20Death = null;
            DatasScoutKill = null;
            DatasScoutDeath = null;
        }
    }
}
