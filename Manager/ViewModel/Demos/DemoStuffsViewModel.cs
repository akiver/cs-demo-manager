using System.Collections.Generic;
using System.Threading.Tasks;
using System.Windows.Media.Imaging;
using Core;
using Core.Models;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using GalaSoft.MvvmLight.Threading;
using Manager.Models;
using Manager.Services;
using Manager.Views.Demos;
using Services.Concrete;
using Services.Interfaces;
using Demo = Core.Models.Demo;

namespace Manager.ViewModel.Demos
{
	public class DemoStuffsViewModel : ViewModelBase
	{
		#region Properties

		private readonly DialogService _dialogService;

		private DrawService _drawService;

		private readonly IStuffService _stuffService;

		private readonly ICacheService _cacheService;

		private readonly IMapService _mapService;

		private Demo _currentDemo;

		private bool _isBusy;

		private string _notificationMessage;

		private Stuff _selectedStuff;

		private Player _selectedPlayer;

		private WriteableBitmap _overviewLayer;

		private WriteableBitmap _stuffLayer;

		private List<Stuff> _stuffs; 

		private List<ComboboxSelector> _stuffSelectors = new List<ComboboxSelector>();

		private ComboboxSelector _currentStuffSelector;

		private RelayCommand<Demo> _backToDemoDetailsCommand;

		private RelayCommand _stuffTypeChangedCommand;

		private RelayCommand _windowLoadedCommand;

		private RelayCommand<Stuff> _watchStuffCommand;

		private RelayCommand _watchPlayerStuffCommand;

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

		public Player SelectedPlayer
		{
			get { return _selectedPlayer; }
			set { Set(() => SelectedPlayer, ref _selectedPlayer, value); }
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
						await LoadData();
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
							var detailsViewModel = new ViewModelLocator().DemoDetails;
							detailsViewModel.CurrentDemo = demo;
							var mainViewModel = new ViewModelLocator().Main;
							DemoDetailsView detailsView = new DemoDetailsView();
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
							GameLauncher launcher = new GameLauncher(CurrentDemo);
							launcher.WatchDemoAt(stuff.Tick, true, SelectedStuff.ThrowerSteamId);
						}));
			}
		}

		public RelayCommand WatchPlayerStuffCommand
		{
			get
			{
				return _watchPlayerStuffCommand
					?? (_watchPlayerStuffCommand = new RelayCommand(
						async () =>
						{
							if (AppSettings.SteamExePath() == null)
							{
								await _dialogService.ShowSteamNotFoundAsync();
								return;
							}
							GameLauncher launcher = new GameLauncher(CurrentDemo);
							launcher.WatchPlayerStuff(SelectedPlayer, CurrentStuffSelector.Id);
						}, () => CurrentDemo != null && SelectedPlayer != null));
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

		public DemoStuffsViewModel(
			DialogService dialogService, ICacheService cacheService, IStuffService stuffService,
			IMapService mapService)
		{
			_dialogService = dialogService;
			_cacheService = cacheService;
			_stuffService = stuffService;
			_mapService = mapService;

			StuffSelectors.Add(new ComboboxSelector("smokes", "Smokes"));
			StuffSelectors.Add(new ComboboxSelector("flashbangs", "Flashbangs"));
			StuffSelectors.Add(new ComboboxSelector("he", "HE Grenades"));
			StuffSelectors.Add(new ComboboxSelector("molotovs", "Molotovs"));
			StuffSelectors.Add(new ComboboxSelector("decoys", "Decoys"));
			CurrentStuffSelector = StuffSelectors[0];

			if (IsInDesignMode)
			{
				CurrentStuffSelector = StuffSelectors[1];
				DispatcherHelper.CheckBeginInvokeOnUI(async () =>
				{
					await LoadData();
					SelectedStuff = Stuffs[10];
				});
			}
		}

		private async Task LoadData()
		{
			NotificationMessage = "Loading...";
			IsBusy = true;
			if (IsInDesignMode)
			{
				CurrentDemo = await _cacheService.GetDemoDataFromCache(string.Empty);
			}
			CurrentDemo.WeaponFired = await _cacheService.GetDemoWeaponFiredAsync(CurrentDemo);
			_mapService.InitMap(CurrentDemo);
			OverviewLayer = _mapService.GetWriteableImage();
			_drawService = new DrawService(_mapService);
			StuffLayer = _drawService.SmokeLayer;
			await LoadStuffs();
			IsBusy = false;
		}

		public override void Cleanup()
		{
			base.Cleanup();
			OverviewLayer = null;
			StuffLayer = null;
		}
	}
}
