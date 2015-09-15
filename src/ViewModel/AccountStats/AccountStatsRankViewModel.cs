using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Windows;
using System.Windows.Input;
using CSGO_Demos_Manager.Models.Charts;
using CSGO_Demos_Manager.Services;
using CSGO_Demos_Manager.Views;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using GalaSoft.MvvmLight.Threading;

namespace CSGO_Demos_Manager.ViewModel.AccountStats
{
	public class AccountStatsRankViewModel : ViewModelBase
	{
		#region Properties

		private readonly IDemosService _demosService;

		private bool _isBusy;

		private string _notificationMessage;

		private double _zoomCoefficientX = 1.0;

		private double _zoomOffsetX;

		private double _minDate;

		private double _maxDate;

		private ObservableCollection<RankDateChart> _datas;

		private RelayCommand _windowLoadedCommand;

		private RelayCommand _backToHomeCommand;

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

		public ObservableCollection<RankDateChart> Datas
		{
			get { return _datas; }
			set { Set(() => Datas, ref _datas, value); }
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

		public double MinDate
		{
			get { return _minDate; }
			set { Set(() => MinDate, ref _minDate, value); }
		}

		public double MaxDate
		{
			get { return _maxDate; }
			set { Set(() => MaxDate, ref _maxDate, value); }
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
						List<RankDateChart> datas = await _demosService.GetRankDateChartDataAsync();
						Datas = new ObservableCollection<RankDateChart>(datas);
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
						_xPosition = (int) point.X;
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
							if ((int) point.X > _xPosition)
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
					}));
			}
		}

		#endregion

		public AccountStatsRankViewModel(IDemosService demoService)
		{
			_demosService = demoService;

			if (IsInDesignMode)
			{
				DispatcherHelper.Initialize();
				NotificationMessage = "Loading...";
				IsBusy = true;
				Application.Current.Dispatcher.Invoke(async () =>
				{
					List<RankDateChart> datas = await _demosService.GetRankDateChartDataAsync();
					Datas = new ObservableCollection<RankDateChart>(datas);
				});
			}
		}
	}
}