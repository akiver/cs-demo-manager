using System.Collections.Generic;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
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

		private double _zoomCoefficientX = 1.0;

		private double _zoomOffsetX;

		private List<GenericDateChart> _datasHeadshot;

		private List<GenericDateChart> _datasDamage;

		private List<GenericDateChart> _datasWin;

		private List<GenericDateChart> _datasKill;

		private RelayCommand _windowLoadedCommand;

		private RelayCommand _backToHomeCommand;

		private RelayCommand _goToOverallCommand;

		private RelayCommand _goToMapCommand;

		private RelayCommand _goToWeaponCommand;

		private RelayCommand _goToRankCommand;

		private RelayCommand<MouseWheelEventArgs> _mouseWheelCommand;

		private RelayCommand<MouseEventArgs> _mouseDownCommand;

		private RelayCommand _mouseUpCommand;

		private RelayCommand<MouseEventArgs> _mouseMoveCommand;

		private RelayCommand _mouseLeaveCommand;

		private bool _isMouseDown;

		private int _xPosition;

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

		public List<GenericDateChart> DatasHeadshot
		{
			get { return _datasHeadshot; }
			set { Set(() => DatasHeadshot, ref _datasHeadshot, value); }
		}

		public List<GenericDateChart> DatasWin
		{
			get { return _datasWin; }
			set { Set(() => DatasWin, ref _datasWin, value); }
		}

		public List<GenericDateChart> DatasDamage
		{
			get { return _datasDamage; }
			set { Set(() => DatasDamage, ref _datasDamage, value); }
		}

		public List<GenericDateChart> DatasKill
		{
			get { return _datasKill; }
			set { Set(() => DatasKill, ref _datasKill, value); }
		}

		public double ZoomCoefficientX
		{
			get { return _zoomCoefficientX; }
			set { Set(() => ZoomCoefficientX, ref _zoomCoefficientX, value); }
		}

		public double ZoomOffsetX
		{
			get { return _zoomOffsetX; }
			set { Set(() => ZoomOffsetX, ref _zoomOffsetX, value); }
		}

		public bool IsMouseDown
		{
			get { return _isMouseDown; }
			set { Set(() => IsMouseDown, ref _isMouseDown, value); }
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

		public RelayCommand<MouseWheelEventArgs> MouseWheelCommand
		{
			get
			{
				return _mouseWheelCommand
					?? (_mouseWheelCommand = new RelayCommand<MouseWheelEventArgs>(
					e =>
					{
						// MOUSE UP
						if (e.Delta > 0)
						{
							if (ZoomCoefficientX > 0) ZoomCoefficientX -= 0.1;
							if (ZoomCoefficientX < 0) ZoomCoefficientX = 0;
						}
						else
						{
							// MOUSE DOWN
							if (ZoomCoefficientX < 1) ZoomCoefficientX += 0.1;
							if (ZoomCoefficientX > 1) ZoomCoefficientX = 1;
						}
					}));
			}
		}

		public RelayCommand<MouseEventArgs> MouseDownCommand
		{
			get
			{
				return _mouseDownCommand
					?? (_mouseDownCommand = new RelayCommand<MouseEventArgs>(
					e =>
					{
						IsMouseDown = true;
						// Save the position when use click on the chart
						Point point = Mouse.GetPosition((IInputElement)e.Source);
						_xPosition = (int)point.X;
					}));
			}
		}

		public RelayCommand MouseUpCommand
		{
			get
			{
				return _mouseUpCommand
					?? (_mouseUpCommand = new RelayCommand(
					() =>
					{
						IsMouseDown = false;
					}));
			}
		}

		public RelayCommand MouseLeaveCommand
		{
			get
			{
				return _mouseLeaveCommand
					?? (_mouseLeaveCommand = new RelayCommand(
					() =>
					{
						IsMouseDown = false;
					}));
			}
		}

		public RelayCommand<MouseEventArgs> MouseMoveCommand
		{
			get
			{
				return _mouseMoveCommand
					?? (_mouseMoveCommand = new RelayCommand<MouseEventArgs>(
					e =>
					{
						// Move chart only when the user maintains the click
						if (IsMouseDown && ZoomCoefficientX < 1)
						{
							// Get the current position to compare with the previous one
							Point point = Mouse.GetPosition((IInputElement)e.Source);
							// Move to the right
							if ((int)point.X > _xPosition)
							{
								if (ZoomOffsetX > 0) ZoomOffsetX -= 0.005;
							}
							else
							{
								// Move to the left
								if (ZoomOffsetX < 1) ZoomOffsetX += 0.005;
							}
							_xPosition = (int)point.X;
						}
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
			IsMouseDown = false;
			ZoomCoefficientX = 1.0;
			ZoomOffsetX = 0;
		}
	}
}