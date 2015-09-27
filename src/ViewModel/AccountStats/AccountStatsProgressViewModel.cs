using System.Collections.Generic;
using System.Threading.Tasks;
using System.Windows;
using CSGO_Demos_Manager.Models.Charts;
using CSGO_Demos_Manager.Models.Stats;
using CSGO_Demos_Manager.Services;
using CSGO_Demos_Manager.Views;
using CSGO_Demos_Manager.Views.AccountStats;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;

namespace CSGO_Demos_Manager.ViewModel.AccountStats
{
	public class AccountStatsProgressViewModel : ViewModelBase
	{
		#region Properties

		private readonly IDemosService _demosService;

		private bool _isBusy;

		private string _notificationMessage;

		private bool _isKillChartEnabled = true;

		private bool _isWinChartEnabled = true;

		private bool _isDamageChartEnabled = true;

		private bool _isHeadshotChartEnabled = true;

		private List<HeadshotDateChart> _datasHeadshot;

		private List<DamageDateChart> _datasDamage;

		private List<WinDateChart> _datasWin;

		private List<KillDateChart> _datasKill;

		private RelayCommand _windowLoadedCommand;

		private RelayCommand _backToHomeCommand;

		private RelayCommand _goToOverallCommand;

		private RelayCommand _goToMapCommand;

		private RelayCommand _goToWeaponCommand;

		private RelayCommand _goToRankCommand;

		private RelayCommand<bool> _toggleWinChartCommand;

		private RelayCommand<bool> _toggleKillChartCommand;

		private RelayCommand<bool> _toggleDamageChartCommand;

		private RelayCommand<bool> _toggleHeadshotChartCommand;

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

		public bool IsKillChartEnabled
		{
			get { return _isKillChartEnabled; }
			set { Set(() => IsKillChartEnabled, ref _isKillChartEnabled, value); }
		}

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

		public List<HeadshotDateChart> DatasHeadshot
		{
			get { return _datasHeadshot; }
			set { Set(() => DatasHeadshot, ref _datasHeadshot, value); }
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
						IsBusy = true;
						NotificationMessage = "Loading...";
						await LoadDatas();
						IsBusy = false;
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
		/// Command to go to the weapon stats page
		/// </summary>
		public RelayCommand GoToWeaponCommand
		{
			get
			{
				return _goToWeaponCommand
					?? (_goToWeaponCommand = new RelayCommand(
					() =>
					{
						var mainViewModel = (new ViewModelLocator()).Main;
						Application.Current.Properties["LastPageViewed"] = mainViewModel.CurrentPage.CurrentPage;
						WeaponView weaponView = new WeaponView();
						mainViewModel.CurrentPage.ShowPage(weaponView);
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
		/// Command when the checkbox to toggle win chart is clicked
		/// </summary>
		public RelayCommand<bool> ToggleWinChartCommand
		{
			get
			{
				return _toggleWinChartCommand
					?? (_toggleWinChartCommand = new RelayCommand<bool>(
						isChecked =>
						{
							IsWinChartEnabled = isChecked;
						},
						isChecked => !IsBusy));
			}
		}

		/// <summary>
		/// Command when the checkbox to toggle kills chart is clicked
		/// </summary>
		public RelayCommand<bool> ToggleKillChartCommand
		{
			get
			{
				return _toggleKillChartCommand
					?? (_toggleKillChartCommand = new RelayCommand<bool>(
						isChecked =>
						{
							IsKillChartEnabled = isChecked;
						},
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
						isChecked =>
						{
							IsDamageChartEnabled = isChecked;
						},
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
						isChecked =>
						{
							IsHeadshotChartEnabled = isChecked;
						},
						isChecked => !IsBusy));
			}
		}

		#endregion

		private async Task LoadDatas()
		{
			ProgressStats datas = await _demosService.GetProgressStatsAsync();
			DatasWin = datas.Win;
			DatasDamage = datas.Damage;
			DatasHeadshot = datas.HeadshotRatio;
			DatasKill = datas.Kill;
		}

		public AccountStatsProgressViewModel(IDemosService demoService)
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

		public override void Cleanup()
		{
			base.Cleanup();
			DatasDamage = null;
			DatasKill = null;
			DatasWin = null;
			DatasHeadshot = null;
		}
	}
}