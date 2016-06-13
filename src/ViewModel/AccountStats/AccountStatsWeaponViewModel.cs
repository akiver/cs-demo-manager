﻿using System.Collections.Generic;
using System.Threading.Tasks;
using System.Windows;
using CSGO_Demos_Manager.Messages;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Stats;
using CSGO_Demos_Manager.Services.Interfaces;
using CSGO_Demos_Manager.Views;
using CSGO_Demos_Manager.Views.AccountStats;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using GalaSoft.MvvmLight.Messaging;
using GalaSoft.MvvmLight.Threading;
using Telerik.Charting;

namespace CSGO_Demos_Manager.ViewModel.AccountStats
{
	public class AccountStatsWeaponViewModel : ViewModelBase
	{
		#region Properties

		private readonly IDemosService _demosService;

		private RelayCommand _windowLoadedCommand;

		private RelayCommand _goToOverallCommand;

		private RelayCommand _backToHomeCommand;

		private RelayCommand _goToRankCommand;

		private RelayCommand _goToMapCommand;

		private RelayCommand _goToProgressCommand;

		private bool _isBusy;

		private string _notificationMessage;

		private const string KILLS = "Kills";

		private const string DEATHS = "Deaths";

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

		public bool IsBusy
		{
			get { return _isBusy; }
			set { Set(() => IsBusy, ref _isBusy, value); }
		}

		public string NotificationMessage
		{
			get { return _notificationMessage; }
			set { Set(() => NotificationMessage, ref _notificationMessage, value); }
		}

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
						var mainViewModel = (new ViewModelLocator()).Main;
						Application.Current.Properties["LastPageViewed"] = mainViewModel.CurrentPage.CurrentPage;
						OverallView overallView = new OverallView();
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
						var mainViewModel = (new ViewModelLocator()).Main;
						Application.Current.Properties["LastPageViewed"] = mainViewModel.CurrentPage.CurrentPage;
						HomeView homeView = new HomeView();
						mainViewModel.CurrentPage.ShowPage(homeView);
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
						var mainViewModel = (new ViewModelLocator()).Main;
						Application.Current.Properties["LastPageViewed"] = mainViewModel.CurrentPage.CurrentPage;
						RankView rankView = new RankView();
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
						var mainViewModel = (new ViewModelLocator()).Main;
						Application.Current.Properties["LastPageViewed"] = mainViewModel.CurrentPage.CurrentPage;
						MapView mapView = new MapView();
						mainViewModel.CurrentPage.ShowPage(mapView);
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
						var mainViewModel = (new ViewModelLocator()).Main;
						Application.Current.Properties["LastPageViewed"] = mainViewModel.CurrentPage.CurrentPage;
						ProgressView progressView = new ProgressView();
						mainViewModel.CurrentPage.ShowPage(progressView);
						Cleanup();
					}));
			}
		}

		#endregion

		private async Task LoadDatas()
		{
			IsBusy = true;
			NotificationMessage = "Loading...";
			WeaponStats datas = await _demosService.GetWeaponStatsAsync();

			DatasAk47Kill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.AK_47,
					Value = datas.KillAk47Count,
					Label = KILLS
				}
			};

			DatasAk47Death = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.AK_47,
					Value = datas.DeathAk47Count,
					Label = DEATHS
				}
			};

			DatasM4A4Kill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.M4A4,
					Value = datas.KillM4A4Count,
					Label = KILLS
				}
			};

			DatasM4A4Death = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.M4A4,
					Value = datas.DeathM4A4Count,
					Label = DEATHS
				}
			};

			DatasM4A1Kill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.M4A1,
					Value = datas.KillM4A1Count,
					Label = KILLS
				}
			};

			DatasM4A1Death = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.M4A1,
					Value = datas.DeathM4A1Count,
					Label = DEATHS
				}
			};

			DatasAugKill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.AUG,
					Value = datas.KillAugCount,
					Label = KILLS
				}
			};

			DatasAugDeath = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.AUG,
					Value = datas.DeathAugCount,
					Label = DEATHS
				}
			};

			DatasGalilarKill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.GALIL,
					Value = datas.KillGalilarCount,
					Label = KILLS
				}
			};

			DatasGalilarDeath = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.GALIL,
					Value = datas.DeathGalilarCount,
					Label = DEATHS
				}
			};

			DatasSg553Kill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.SG_553,
					Value = datas.KillSg553Count,
					Label = KILLS
				}
			};

			DatasSg553Death = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.SG_553,
					Value = datas.DeathSg553Count,
					Label = DEATHS
				}
			};

			DatasFamasKill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.FAMAS,
					Value = datas.KillFamasCount,
					Label = KILLS
				}
			};

			DatasFamasDeath = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.FAMAS,
					Value = datas.DeathFamasCount,
					Label = DEATHS
				}
			};

			// Snipers
			DatasAwpKill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.AWP,
					Value = datas.KillAwpCount,
					Label = KILLS
				}
			};

			DatasAwpDeath = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.AWP,
					Value = datas.DeathAwpCount,
					Label = DEATHS
				}
			};

			DatasScar20Kill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.SCAR_20,
					Value = datas.KillScar20Count,
					Label = KILLS
				}
			};

			DatasScar20Death = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.SCAR_20,
					Value = datas.DeathScar20Count,
					Label = DEATHS
				}
			};

			DatasG3Sg1Kill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.G3SG1,
					Value = datas.KillG3Sg1Count,
					Label = KILLS
				}
			};

			DatasG3Sg1Death = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.G3SG1,
					Value = datas.DeathG3Ssg1Count,
					Label = DEATHS
				}
			};

			DatasScoutKill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.SSG_08,
					Value = datas.KillScoutCount,
					Label = KILLS
				}
			};

			DatasScoutDeath = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.SSG_08,
					Value = datas.DeathScoutCount,
					Label = DEATHS
				}
			};

			// SMGs
			DatasMp7Kill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.MP7,
					Value = datas.KillMp7Count,
					Label = KILLS
				}
			};

			DatasMp7Death = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.MP7,
					Value = datas.DeathMp7Count,
					Label = DEATHS
				}
			};

			DatasMp9Kill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.MP9,
					Value = datas.KillMp9Count,
					Label = KILLS
				}
			};

			DatasMp9Death = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.MP9,
					Value = datas.DeathMp9Count,
					Label = DEATHS
				}
			};

			DatasP90Kill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.P90,
					Value = datas.KillP90Count,
					Label = KILLS
				}
			};

			DatasP90Death = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.P90,
					Value = datas.DeathP90Count,
					Label = DEATHS
				}
			};

			DatasBizonKill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.PP_BIZON,
					Value = datas.KillBizonCount,
					Label = KILLS
				}
			};

			DatasBizonDeath = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.PP_BIZON,
					Value = datas.DeathBizonCount,
					Label = DEATHS
				}
			};

			DatasMac10Kill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.MAC_10,
					Value = datas.KillMac10Count,
					Label = KILLS
				}
			};

			DatasMac10Death = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.MAC_10,
					Value = datas.DeathMac10Count,
					Label = DEATHS
				}
			};

			DatasUmp45Kill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.UMP_45,
					Value = datas.KillUmp45Count,
					Label = KILLS
				}
			};

			DatasUmp45Death = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.UMP_45,
					Value = datas.DeathUmp45Count,
					Label = DEATHS
				}
			};

			// Heavy
			DatasNovaKill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.NOVA,
					Value = datas.KillNovaCount,
					Label = KILLS
				}
			};

			DatasNovaDeath = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.NOVA,
					Value = datas.DeathNovaCount,
					Label = DEATHS
				}
			};

			DatasXm1014Kill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.XM1014,
					Value = datas.KillXm1014Count,
					Label = KILLS
				}
			};

			DatasXm1014Death = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.XM1014,
					Value = datas.DeathXm1014Count,
					Label = DEATHS
				}
			};

			DatasMag7Kill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.MAG_7,
					Value = datas.KillMag7Count,
					Label = KILLS
				}
			};

			DatasMag7Death = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.MAG_7,
					Value = datas.DeathMag7Count,
					Label = DEATHS
				}
			};

			DatasSawedOffKill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.SAWED_OFF,
					Value = datas.KillSawedOffCount,
					Label = KILLS
				}
			};

			DatasSawedOffDeath = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.SAWED_OFF,
					Value = datas.DeathSawedOffCount,
					Label = DEATHS
				}
			};

			DatasM249Kill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.M249,
					Value = datas.KillM249Count,
					Label = KILLS
				}
			};

			DatasM249Death = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.M249,
					Value = datas.DeathM249Count,
					Label = DEATHS
				}
			};

			DatasNegevKill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.NEGEV,
					Value = datas.KillNegevCount,
					Label = KILLS
				}
			};

			DatasNegevDeath = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.NEGEV,
					Value = datas.DeathNegevCount,
					Label = DEATHS
				}
			};

			// Pistols
			DatasGlockKill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.GLOCK,
					Value = datas.KillGlockCount,
					Label = KILLS
				}
			};

			DatasGlockDeath = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.GLOCK,
					Value = datas.DeathGlockCount,
					Label = DEATHS
				}
			};

			DatasUspKill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.USP,
					Value = datas.KillUspCount,
					Label = KILLS
				}
			};

			DatasUspDeath = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.USP,
					Value = datas.DeathUspCount,
					Label = DEATHS
				}
			};

			DatasP2000Kill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.P2000,
					Value = datas.KillP2000Count,
					Label = KILLS
				}
			};

			DatasP2000Death = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.P2000,
					Value = datas.DeathP2000Count,
					Label = DEATHS
				}
			};

			DatasP250Kill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.P250,
					Value = datas.KillP250Count,
					Label = KILLS
				}
			};

			DatasP250Death = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.P250,
					Value = datas.DeathP250Count,
					Label = DEATHS
				}
			};

			DatasTec9Kill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.TEC_9,
					Value = datas.KillTec9Count,
					Label = KILLS
				}
			};

			DatasTec9Death = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.TEC_9,
					Value = datas.DeathTec9Count,
					Label = DEATHS
				}
			};

			DatasDeagleKill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.DEAGLE,
					Value = datas.KillDeagleCount,
					Label = KILLS
				}
			};

			DatasDeagleDeath = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.DEAGLE,
					Value = datas.DeathDeagleCount,
					Label = DEATHS
				}
			};

			DatasFiveSevenKill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.FIVE_SEVEN,
					Value = datas.KillFiveSevenCount,
					Label = KILLS
				}
			};

			DatasFiveSevenDeath = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.FIVE_SEVEN,
					Value = datas.DeathFiveSevenCount,
					Label = DEATHS
				}
			};

			DatasDualEliteKill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.DUAL_BERETTAS,
					Value = datas.KillDualEliteCount,
					Label = KILLS
				}
			};

			DatasDualEliteDeath = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.DUAL_BERETTAS,
					Value = datas.DeathDualEliteCount,
					Label = DEATHS
				}
			};

			DatasCz75Kill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.CZ75,
					Value = datas.KillCz75Count,
					Label = KILLS
				}
			};

			DatasCz75Death = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.CZ75,
					Value = datas.DeathCz75Count,
					Label = DEATHS
				}
			};

			// Equipement
			DatasHeGrenadeKill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.HE,
					Value = datas.KillHeGrenadeCount,
					Label = KILLS
				}
			};

			DatasHeGrenadeDeath = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.HE,
					Value = datas.DeathHeGrenadeCount,
					Label = DEATHS
				}
			};

			DatasMolotovKill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.MOLOTOV,
					Value = datas.KillMolotovCount,
					Label = KILLS
				}
			};

			DatasMolotovDeath = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.MOLOTOV,
					Value = datas.DeathMolotovCount,
					Label = DEATHS
				}
			};

			DatasIncendiaryKill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.INCENDIARY,
					Value = datas.KillIncendiaryCount,
					Label = KILLS
				}
			};

			DatasIncendiaryDeath = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.INCENDIARY,
					Value = datas.DeathIncendiaryCount,
					Label = DEATHS
				}
			};

			DatasTazerKill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.ZEUS,
					Value = datas.KillTazerCount,
					Label = KILLS
				}
			};

			DatasTazerDeath = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.ZEUS,
					Value = datas.DeathTazerCount,
					Label = DEATHS
				}
			};

			DatasKnifeKill = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.KNIFE,
					Value = datas.KillKnifeCount,
					Label = KILLS
				}
			};

			DatasKnifeDeath = new List<CategoricalDataPoint>
			{
				new CategoricalDataPoint
				{
					Category = Weapon.KNIFE,
					Value = datas.DeathKnifeCount,
					Label = DEATHS
				}
			};

			SmokeThrownCount = datas.SmokeThrownCount;
			DecoyThrownCount = datas.DecoyThrownCount;
			FlashbangThrownCount = datas.FlashbangThrownCount;
			HeGrenadeThrownCount = datas.HeGrenadeThrownCount;
			MolotovThrownCount = datas.MolotovThrownCount;
			IncendiaryThrownCount = datas.IncendiaryThrownCount;
			IsBusy = false;
		}

		public AccountStatsWeaponViewModel(IDemosService demoService)
		{
			_demosService = demoService;

			if (IsInDesignMode)
			{
				Application.Current.Dispatcher.Invoke(async () =>
				{
					await LoadDatas();
				});
			}
		}

		private void HandleSettingsFlyoutClosedMessage(SettingsFlyoutClosed msg)
		{
			DispatcherHelper.CheckBeginInvokeOnUI(
				async () =>
				{
					await LoadDatas();
				});
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
