using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using CSGO_Demos_Manager.Exceptions.Map;
using CSGO_Demos_Manager.Internals;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Events;
using CSGO_Demos_Manager.Services;
using CSGO_Demos_Manager.Services.Map;
using CSGO_Demos_Manager.Views;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using MahApps.Metro.Controls.Dialogs;
using MediaColor = System.Windows.Media.Color;

namespace CSGO_Demos_Manager.ViewModel
{
	public class OverviewViewModel : ViewModelBase
	{
		#region Properties

		private Demo _currentDemo;

		private Round _selectedRound;

		private PlayerExtended _selectedPlayer;

		private bool _isBusy;

		private bool _isPlaying;

		private bool _isPaused;

		private string _messageNotification;

		private int _volume = 10;

		private WriteableBitmap _writeableBitmapOverview;

		private WriteableBitmap _writeableBitmapWeapon;

		private WriteableBitmap _writeableBitmapKill;

		private WriteableBitmap _writeableBitmapSmoke;

		private WriteableBitmap _writeableBitmapFlashbang;

		private WriteableBitmap _writeableBitmapHegrenade;

		private WriteableBitmap _writeableBitmapDecoy;

		private WriteableBitmap _writeableBitmapMolotov;

		private WriteableBitmap _writeableBitmapPlayerMarker;

		private TimeSpan LastRenderTime { get; set; }

		List<List<PositionPoint>> Points { get; set; }

		private ObservableCollection<BaseEvent> _events = new ObservableCollection<BaseEvent>();

		private List<ComboboxSelector> _teamSelectors = new List<ComboboxSelector>();

		private ObservableCollection<PlayerColor> _playersColors = new ObservableCollection<PlayerColor>();

		private ComboboxSelector _currentTeamSelector;

		private readonly DialogService _dialogService;

		private readonly IDemosService _demoService;

		private DrawService _drawService;

		private RelayCommand _playCommand;

		private RelayCommand _stopCommand;

		private RelayCommand _pauseCommand;

		private RelayCommand<Demo> _backToDemoDetailsCommand;

		private double FrameLimiter
		{
			get
			{
				if (CurrentDemo.Tickrate > 0 && CurrentDemo.Tickrate <= 17)
				{
					return 16 * _frameLimiterMultiplier;
				}
				if (CurrentDemo.Tickrate > 17 && CurrentDemo.Tickrate <= 33)
				{
					return 47 * _frameLimiterMultiplier;
				}
				if (CurrentDemo.Tickrate > 33 && CurrentDemo.Tickrate <= 44)
				{
					if (_frameLimiterMultiplier > 1) _frameLimiterMultiplier *= 1.5;
					return 57 * _frameLimiterMultiplier;
				}
				if (_frameLimiterMultiplier > 1) _frameLimiterMultiplier *= 2;
				return 70 * _frameLimiterMultiplier;
			}
		}

		private double _frameLimiterMultiplier = 1;

		#endregion

		#region Accessors

		public Demo CurrentDemo
		{
			get { return _currentDemo; }
			set { Set(() => CurrentDemo, ref _currentDemo, value); }
		}

		public WriteableBitmap WriteableBitmapOverview
		{
			get { return _writeableBitmapOverview; }
			set { Set(() => WriteableBitmapOverview, ref _writeableBitmapOverview, value); }
		}

		public WriteableBitmap WriteableBitmapWeapon
		{
			get { return _writeableBitmapWeapon; }
			set { Set(() => WriteableBitmapWeapon, ref _writeableBitmapWeapon, value); }
		}

		public WriteableBitmap WriteableBitmapKill
		{
			get { return _writeableBitmapKill; }
			set { Set(() => WriteableBitmapKill, ref _writeableBitmapKill, value); }
		}

		public WriteableBitmap WriteableBitmapSmoke
		{
			get { return _writeableBitmapSmoke; }
			set { Set(() => WriteableBitmapSmoke, ref _writeableBitmapSmoke, value); }
		}

		public WriteableBitmap WriteableBitmapFlashbang
		{
			get { return _writeableBitmapFlashbang; }
			set { Set(() => WriteableBitmapFlashbang, ref _writeableBitmapFlashbang, value); }
		}

		public WriteableBitmap WriteableBitmapHegrenade
		{
			get { return _writeableBitmapHegrenade; }
			set { Set(() => WriteableBitmapHegrenade, ref _writeableBitmapHegrenade, value); }
		}

		public WriteableBitmap WriteableBitmapDecoy
		{
			get { return _writeableBitmapDecoy; }
			set { Set(() => WriteableBitmapDecoy, ref _writeableBitmapDecoy, value); }
		}

		public WriteableBitmap WriteableBitmapMolotov
		{
			get { return _writeableBitmapMolotov; }
			set { Set(() => WriteableBitmapMolotov, ref _writeableBitmapMolotov, value); }
		}

		public WriteableBitmap WriteableBitmapPlayerMarker
		{
			get { return _writeableBitmapPlayerMarker; }
			set { Set(() => WriteableBitmapPlayerMarker, ref _writeableBitmapPlayerMarker, value); }
		}

		public ObservableCollection<BaseEvent> Events
		{
			get { return _events; }
			set { Set(() => Events, ref _events, value); }
		}

		public ObservableCollection<PlayerColor> PlayersColor
		{
			get { return _playersColors; }
			set { Set(() => PlayersColor, ref _playersColors, value); }
		}

		public Round SelectedRound
		{
			get { return _selectedRound; }
			set { Set(() => SelectedRound, ref _selectedRound, value); }
		}

		public PlayerExtended SelectedPlayer
		{
			get { return _selectedPlayer; }
			set
			{
				Set(() => SelectedPlayer, ref _selectedPlayer, value);
				if (value == null) return;
				if (CurrentTeamSelector != null) CurrentTeamSelector = null;
			}
		}

		public ComboboxSelector CurrentTeamSelector
		{
			get { return _currentTeamSelector; }
			set
			{
				Set(() => CurrentTeamSelector, ref _currentTeamSelector, value);
				if (value == null) return;
				if (SelectedPlayer != null) SelectedPlayer = null;
			}
		}

		public List<ComboboxSelector> TeamSelectors
		{
			get { return _teamSelectors; }
			set { Set(() => TeamSelectors, ref _teamSelectors, value); }
		}

		public int Volume
		{
			get { return _volume; }
			set
			{
				Set(() => Volume, ref _volume, value);
				SoundService.SetVolume(value);
			}
		}

		public double FrameLimiterMultiplier
		{
			get { return _frameLimiterMultiplier; }
			set
			{
				Set(() => FrameLimiterMultiplier, ref _frameLimiterMultiplier, value);
				RaisePropertyChanged("FrameLimiter");
			}
		}

		public bool IsBusy
		{
			get { return _isBusy; }
			set { Set(() => IsBusy, ref _isBusy, value); }
		}

		public bool IsPlaying
		{
			get { return _isPlaying; }
			set { Set(() => IsPlaying, ref _isPlaying, value); }
		}

		public bool IsPaused
		{
			get { return _isPaused; }
			set { Set(() => IsPaused, ref _isPaused, value); }
		}

		public string MessageNotification
		{
			get { return _messageNotification; }
			set { Set(() => MessageNotification, ref _messageNotification, value); }
		}

		#endregion

		#region Commands

		/// <summary>
		/// Command to start animation
		/// </summary>
		public RelayCommand PlayCommand
		{
			get
			{
				return _playCommand
					?? (_playCommand = new RelayCommand(
					async () =>
					{
						if (IsPaused)
						{
							MessageNotification = "Playing...";
							IsPlaying = true;
							IsPaused = false;

							// Resume render loop
							CompositionTarget.Rendering += CompositionTarget_Rendering;
							return;
						}

						IsBusy = true;
						MessageNotification = "Generating data...";

						try
						{
							PlayersColor.Clear();
							Events.Clear();

							MapService mapService = MapService.Factory(CurrentDemo.MapName);
							_drawService = new DrawService(mapService);

							PlayerExtended player = SelectedPlayer;
							Round round = SelectedRound;

							// Analyze demos to get player's positions
							CurrentDemo = await _demoService.AnalyzePlayersPosition(CurrentDemo);

							// Get back selection
							SelectedPlayer = player;
							SelectedRound = round;

							// Generate points to draw
							Points = await _drawService.GetPoints(CurrentDemo, CurrentTeamSelector, player, round);

							// Set players colors on UI
							foreach (List<PositionPoint> positionPoints in Points)
							{
								System.Drawing.Color col = System.Drawing.Color.FromArgb(positionPoints.First().Color);
								PlayerColor playerColor = new PlayerColor()
								{
									Name = positionPoints.First().Player.Name,
									Color = new SolidColorBrush(MediaColor.FromRgb(col.R, col.G, col.B))
								};
								if (!PlayersColor.Contains(playerColor)) PlayersColor.Add(playerColor);
							}

							if (!Points.Any())
							{
								await _dialogService.ShowMessageAsync("No points found. You may have to analyze this demo.", MessageDialogStyle.Affirmative);
								IsBusy = false;
								return;
							}

							InitLayers();

							MessageNotification = "Playing...";
							IsPlaying = true;

							CommandManager.InvalidateRequerySuggested();

							// Start render loop
							CompositionTarget.Rendering += CompositionTarget_Rendering;
						}
						catch (Exception e)
						{
							IsPlaying = false;
							IsBusy = false;

							if (!(e is MapException)) Logger.Instance.Log(e);
							if (e is MapException)
							{
								await _dialogService.ShowErrorAsync(e.Message, MessageDialogStyle.Affirmative).ConfigureAwait(false);
							}
						}

					}, () => (!IsBusy && !IsPaused || IsBusy && IsPaused) && (SelectedPlayer != null || CurrentTeamSelector != null) && SelectedRound != null));
			}
		}

		/// <summary>
		/// Command to stop animation
		/// </summary>
		public RelayCommand StopCommand
		{
			get
			{
				return _stopCommand
					?? (_stopCommand = new RelayCommand(
					() =>
					{
						CompositionTarget.Rendering -= CompositionTarget_Rendering;
						IsBusy = false;
						IsPlaying = false;
						IsPaused = false;
						CurrentDemo.PositionsPoint.Clear();
						Points.Clear();
					}, () => IsBusy && (SelectedPlayer != null || CurrentTeamSelector != null) && SelectedRound != null));
			}
		}

		/// <summary>
		/// Command to pause animation
		/// </summary>
		public RelayCommand PauseCommand
		{
			get
			{
				return _pauseCommand
					?? (_pauseCommand = new RelayCommand(
					() =>
					{
						MessageNotification = "Paused";
						IsPlaying = false;
						IsPaused = true;
						CompositionTarget.Rendering -= CompositionTarget_Rendering;
					}, () => IsPlaying));
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
							var detailsViewModel = (new ViewModelLocator()).Details;
							detailsViewModel.CurrentDemo = demo;
							var mainViewModel = (new ViewModelLocator()).Main;
							DetailsView detailsView = new DetailsView();
							mainViewModel.CurrentPage.ShowPage(detailsView);
							Cleanup();
						},
						demo => CurrentDemo != null && !IsBusy));
			}
		}

		#endregion

		public OverviewViewModel(DialogService dialogService, IDemosService demoService)
		{
			_dialogService = dialogService;
			_demoService = demoService;
			TeamSelectors.Add(new ComboboxSelector("CT", "Counter-Terrorists"));
			TeamSelectors.Add(new ComboboxSelector("T", "Terrorists"));
			TeamSelectors.Add(new ComboboxSelector("BOTH", "Both"));
		}

		/// <summary>
		/// Render loop
		/// </summary>
		/// <param name="sender"></param>
		/// <param name="e"></param>
		private void CompositionTarget_Rendering(object sender, EventArgs e)
		{
			TimeSpan timeSinceLastRender = (DateTime.Now.TimeOfDay - LastRenderTime);

			if (timeSinceLastRender.TotalSeconds < (1.0 / FrameLimiter)) return;

			LastRenderTime = DateTime.Now.TimeOfDay;

			// Stop animation if there is no more points
			if (!Points.Any())
			{
				CompositionTarget.Rendering -= CompositionTarget_Rendering;
				IsBusy = false;
				IsPlaying = false;
				CurrentDemo.PositionsPoint.Clear();
				Points.Clear();
				return;
			}

			// Draw points for each player
			foreach (List<PositionPoint> positionPoints in Points)
			{
				if (positionPoints.Any())
				{
					// get the first point of the list
					PositionPoint positionPoint = positionPoints.First();

					// If there is an event at this point, draw it
					if (positionPoint.Event != null)
					{
						if (!string.IsNullOrWhiteSpace(positionPoint.Event.Message))
						{
							_events.Add(positionPoint.Event);
						}

						_drawService.DrawEvent(positionPoint);
					}
					else
					{
						// Draw it
						_drawService.DrawPixel(positionPoint);
						_drawService.DrawPlayerMarker(positionPoint);
					}

					// Remove this point
					positionPoints.Remove(positionPoint);

					// If there is no more points remove the list from all the lists
					if (!positionPoints.Any())
					{
						Points.Remove(positionPoints);
						break;
					}
				}
			}
		}

		public override void Cleanup()
		{
			WriteableBitmapDecoy = null;
			WriteableBitmapFlashbang = null;
			WriteableBitmapHegrenade = null;
			WriteableBitmapKill = null;
			WriteableBitmapMolotov = null;
			WriteableBitmapOverview = null;
			WriteableBitmapPlayerMarker = null;
			WriteableBitmapSmoke = null;
			WriteableBitmapWeapon = null;
			FrameLimiterMultiplier = 1;
			PlayersColor.Clear();
			Events.Clear();
			CurrentDemo = null;
		}

		private void InitLayers()
		{
			WriteableBitmapOverview = _drawService.OverviewLayer;
			WriteableBitmapWeapon = _drawService.WeaponLayer;
			WriteableBitmapKill = _drawService.KillLayer;
			WriteableBitmapSmoke = _drawService.SmokeLayer;
			WriteableBitmapFlashbang = _drawService.FlashbangLayer;
			WriteableBitmapDecoy = _drawService.DecoyLayer;
			WriteableBitmapHegrenade = _drawService.HegrenadeLayer;
			WriteableBitmapMolotov = _drawService.MolotovLayer;
			WriteableBitmapPlayerMarker = _drawService.PlayerMarkerLayer;
		}
	}
}