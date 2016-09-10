using System.Collections.Generic;
using System.Threading.Tasks;
using System.Windows;
using Core.Models;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using GalaSoft.MvvmLight.Messaging;
using GalaSoft.MvvmLight.Threading;
using Manager.Messages;
using Manager.Models;
using Manager.Views.Accounts;
using Manager.Views.Demos;
using Services.Interfaces;
using Services.Models.Charts;

namespace Manager.ViewModel.Accounts
{
	public class AccountRankViewModel : ViewModelBase
	{
		#region Properties

		private readonly IAccountStatsService _accountStatsService;

		private readonly ICacheService _cacheService;

		private bool _isBusy;

		private string _notificationMessage;

		private List<RankDateChart> _datas;

		private RelayCommand _windowLoadedCommand;

		private RelayCommand _backToHomeCommand;

		private RelayCommand _goToOverallCommand;

		private RelayCommand _goToMapCommand;

		private RelayCommand _goToWeaponCommand;

		private RelayCommand _goToProgressCommand;

		private ComboboxSelector _selectedScale;

		private List<ComboboxSelector> _scaleList; 

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
					async () =>
					{
						await LoadData();
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
						var mainViewModel = new ViewModelLocator().Main;
						Application.Current.Properties["LastPageViewed"] = mainViewModel.CurrentPage.CurrentPage;
						AccountWeaponsView weaponsView = new AccountWeaponsView();
						mainViewModel.CurrentPage.ShowPage(weaponsView);
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

		public AccountRankViewModel(IAccountStatsService accountStatsService, ICacheService cacheService)
		{
			_accountStatsService = accountStatsService;
			_cacheService = cacheService;
			ScaleList = new List<ComboboxSelector>
			{
				new ComboboxSelector("none", Properties.Resources.None),
				new ComboboxSelector("day", Properties.Resources.Day),
				new ComboboxSelector("month", Properties.Resources.Month)
			};
			SelectedScale = ScaleList[0];

			if (IsInDesignMode)
			{
				DispatcherHelper.Initialize();
				NotificationMessage = Properties.Resources.NotificationLoading;
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
				async () =>
				{
					await LoadData();
				});
		}

		public override void Cleanup()
		{
			base.Cleanup();
			Datas = null;
		}

		private async Task LoadData()
		{
			IsBusy = true;
			NotificationMessage = Properties.Resources.NotificationLoading;
			List <Demo> demos = await _cacheService.GetFilteredDemoListAsync();
			Datas = await _accountStatsService.GetRankDateChartDataAsync(demos, SelectedScale.Id);
			Messenger.Default.Register<SettingsFlyoutClosed>(this, HandleSettingsFlyoutClosedMessage);
			IsBusy = false;
		}
	}
}