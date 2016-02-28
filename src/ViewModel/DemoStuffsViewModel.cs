using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Windows.Media.Imaging;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Services;
using CSGO_Demos_Manager.Services.Interfaces;
using CSGO_Demos_Manager.Services.Map;
using CSGO_Demos_Manager.Views;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using GalaSoft.MvvmLight.Threading;
using MahApps.Metro.Controls.Dialogs;

namespace CSGO_Demos_Manager.ViewModel
{
	public class DemoStuffsViewModel : ViewModelBase
	{
		#region Properties

		private readonly DialogService _dialogService;

		private DrawService _drawService;

		private readonly IStuffService _stuffService;

		private readonly ICacheService _cacheService;

		private MapService _mapService;

		private Demo _currentDemo;

		private bool _isBusy;

		private string _notificationMessage;

		private Stuff _selectedStuff;

		private WriteableBitmap _overviewLayer;

		private WriteableBitmap _stuffLayer;

		private List<Stuff> _stuffs; 

		private List<ComboboxSelector> _stuffSelectors = new List<ComboboxSelector>();

		private ComboboxSelector _currentStuffSelector;

		private RelayCommand<Demo> _backToDemoDetailsCommand;

		private RelayCommand _stuffTypeChangedCommand;

		private RelayCommand _windowLoadedCommand;

		private RelayCommand<Stuff> _watchStuffCommand;

		#endregion Properties

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

		public Demo CurrentDemo
		{
			get { return _currentDemo; }
			set { Set(() => CurrentDemo, ref _currentDemo, value); }
		}

		public Stuff SelectedStuff
		{
			get { return _selectedStuff; }
			set
			{
				{
					Set(() => SelectedStuff, ref _selectedStuff, value);
					if (value != null) DrawStuff(value);
				}
			}
		}

		public List<ComboboxSelector> StuffSelectors
		{
			get { return _stuffSelectors; }
			set { Set(() => StuffSelectors, ref _stuffSelectors, value); }
		}

		public ComboboxSelector CurrentStuffSelector
		{
			get { return _currentStuffSelector; }
			set { Set(() => CurrentStuffSelector, ref _currentStuffSelector, value); }
		}

		public List<Stuff> Stuffs
		{
			get { return _stuffs; }
			set { Set(() => Stuffs, ref _stuffs, value); }
		}

		public WriteableBitmap StuffLayer
		{
			get { return _stuffLayer; }
			set { Set(() => StuffLayer, ref _stuffLayer, value); }
		}

		public WriteableBitmap OverviewLayer
		{
			get { return _overviewLayer; }
			set { Set(() => OverviewLayer, ref _overviewLayer, value); }
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
						NotificationMessage = "Loading...";
						IsBusy = true;
						CurrentDemo.WeaponFired = await _cacheService.GetDemoWeaponFiredAsync(CurrentDemo);
						_mapService = MapService.Factory(CurrentDemo.MapName);
						OverviewLayer = _mapService.GetWriteableImage();
						_drawService = new DrawService(_mapService);
						StuffLayer = _drawService.SmokeLayer;
						await LoadStuffs();
						IsBusy = false;
					}));
			}
		}

		/// <summary>
		/// Command to back to details view
		/// </summary>
		public RelayCommand<Demo> BackToDemoDetailsCommand
		{
			get
			{
				return _backToDemoDetailsCommand
					?? (_backToDemoDetailsCommand = new RelayCommand<Demo>(
						demo =>
						{
							var detailsViewModel = new ViewModelLocator().Details;
							detailsViewModel.CurrentDemo = demo;
							var mainViewModel = new ViewModelLocator().Main;
							DetailsView detailsView = new DetailsView();
							mainViewModel.CurrentPage.ShowPage(detailsView);
							Cleanup();
						},
						demo => CurrentDemo != null));
			}
		}

		public RelayCommand StuffTypeChangedCommand
		{
			get
			{
				return _stuffTypeChangedCommand
					?? (_stuffTypeChangedCommand = new RelayCommand(
						() =>
						{
							DispatcherHelper.CheckBeginInvokeOnUI(
							async () =>
							{
								await LoadStuffs();
							});
						},
						() => CurrentDemo != null));
			}
		}

		public RelayCommand<Stuff> WatchStuffCommand
		{
			get
			{
				return _watchStuffCommand
					?? (_watchStuffCommand = new RelayCommand<Stuff>(
						async stuff =>
						{
							if (AppSettings.SteamExePath() == null)
							{
								await _dialogService.ShowSteamNotFoundAsync();
								return;
							}
							GameLauncher launcher = new GameLauncher();
							launcher.WatchDemoAt(CurrentDemo, stuff.Tick, true);
						}));
			}
		}

		#endregion

		private void DrawStuff(Stuff stuff)
		{
			_drawService.DrawStuff(stuff);
		}

		private async Task LoadStuffs()
		{
			IsBusy = true;
			Stuffs = await _stuffService.GetStuffPointListAsync(CurrentDemo, CurrentStuffSelector.ToStuffType());
			IsBusy = false;
		}

		public DemoStuffsViewModel(DialogService dialogService, ICacheService cacheService, IStuffService stuffService)
		{
			_dialogService = dialogService;
			_cacheService = cacheService;
			_stuffService = stuffService;

			StuffSelectors.Add(new ComboboxSelector("smokes", "Smokes"));
			StuffSelectors.Add(new ComboboxSelector("flashbangs", "Flashbangs"));
			StuffSelectors.Add(new ComboboxSelector("he", "HE Grenades"));
			StuffSelectors.Add(new ComboboxSelector("molotovs", "Molotovs"));
			StuffSelectors.Add(new ComboboxSelector("decoys", "Decoys"));
			CurrentStuffSelector = StuffSelectors[0];

			if (IsInDesignMode)
			{
				OverviewLayer = BitmapFactory.New(1024, 1024).FromResource("Resources/images/maps/overview/de_dust2.png");
			}
		}

		public override void Cleanup()
		{
			base.Cleanup();
			OverviewLayer = null;
			StuffLayer = null;
		}
	}
}
