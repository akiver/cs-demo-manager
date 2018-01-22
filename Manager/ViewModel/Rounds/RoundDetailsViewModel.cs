using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using Core;
using Core.Models;
using Core.Models.Events;
using GalaSoft.MvvmLight.CommandWpf;
using GalaSoft.MvvmLight.Threading;
using MahApps.Metro.Controls.Dialogs;
using Manager.Properties;
using Manager.Services;
using Manager.ViewModel.Shared;
using Manager.Views.Demos;
using Services.Concrete;
using Services.Concrete.Movie;
using Services.Interfaces;
using Services.Models;
using Services.Models.Stats;
using Services.Models.Timelines;

namespace Manager.ViewModel.Rounds
{
	public class RoundDetailsViewModel : SingleDemoViewModel
	{
		#region Properties

		private readonly IDialogService _dialogService;

		private readonly IRoundService _roundService;

		private readonly IPlayerService _playerService;

		private readonly ICacheService _cacheService;

		private int _roundNumber;

		private Round _currentRound;

		private KillEvent _selectedKill;
		private DateTime _periodStart;
		private DateTime _periodEnd;

		private List<TimelineEvent> _roundEventList;

		private List<PlayerRoundStats> _playersStats;

		private DateTime _visibleStartTime;

		private DateTime _visibleEndTime;

		private RelayCommand _windowLoadedCommand;

		private RelayCommand<Demo> _backToDemoDetailsCommand;

		private RelayCommand<KillEvent> _watchKillCommand;

		private RelayCommand _goToNextRoundCommand;

		private RelayCommand _goToPreviousRound;

		private RelayCommand _watchRoundCommand;

		#endregion

		#region Accessors

		public int RoundNumber
		{
			get { return _roundNumber; }
			set { Set(() => RoundNumber, ref _roundNumber, value); }
		}

		public Round CurrentRound
		{
			get { return _currentRound; }
			set { Set(() => CurrentRound, ref _currentRound, value); }
		}

		public DateTime PeriodStart
		{
			get { return _periodStart; }
			set { Set(() => PeriodStart, ref _periodStart, value); }
		}

		public DateTime PeriodEnd
		{
			get { return _periodEnd; }
			set { Set(() => PeriodEnd, ref _periodEnd, value); }
		}

		public List<TimelineEvent> RoundEventList
		{
			get { return _roundEventList; }
			set { Set(() => RoundEventList, ref _roundEventList, value); }
		}

		public List<PlayerRoundStats> PlayersStats
		{
			get { return _playersStats; }
			set { Set(() => PlayersStats, ref _playersStats, value); }
		}

		public KillEvent SelectedKill
		{
			get { return _selectedKill; }
			set { Set(() => SelectedKill, ref _selectedKill, value); }
		}

		public DateTime VisibleStartTime
		{
			get { return _visibleStartTime; }
			set { Set(() => VisibleStartTime, ref _visibleStartTime, value); }
		}

		public DateTime VisibleEndTime
		{
			get { return _visibleEndTime; }
			set { Set(() => VisibleEndTime, ref _visibleEndTime, value); }
		}

		#endregion

		#region Commands

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
							detailsViewModel.Demo = demo;
							var mainViewModel = new ViewModelLocator().Main;
							DemoDetailsView detailsView = new DemoDetailsView();
							mainViewModel.CurrentPage.ShowPage(detailsView);
						},
						demo => Demo != null));
			}
		}

		/// <summary>
		/// Command to watch the round
		/// </summary>
		public RelayCommand WatchRoundCommand
		{
			get
			{
				return _watchRoundCommand
					?? (_watchRoundCommand = new RelayCommand(
					async () =>
					{
						if (AppSettings.SteamExePath() == null)
						{
							await _dialogService.ShowMessageAsync(Properties.Resources.DialogSteamNotFound, MessageDialogStyle.Affirmative);
							return;
						}
						GameLauncherConfiguration config = new GameLauncherConfiguration(Demo)
						{
							SteamExePath = AppSettings.SteamExePath(),
							Width = Settings.Default.ResolutionWidth,
							Height = Settings.Default.ResolutionHeight,
							Fullscreen = Settings.Default.IsFullscreen,
							EnableHlae = Settings.Default.EnableHlae,
							CsgoExePath = Settings.Default.CsgoExePath,
							EnableHlaeConfigParent = Settings.Default.EnableHlaeConfigParent,
							HlaeConfigParentFolderPath = Settings.Default.HlaeConfigParentFolderPath,
							HlaeExePath = HlaeService.GetHlaeExePath(),
							LaunchParameters = Settings.Default.LaunchParameters,
							UseCustomActionsGeneration = Settings.Default.UseCustomActionsGeneration,
							FocusPlayerSteamId = Settings.Default.WatchAccountSteamId,
						};
						GameLauncher launcher = new GameLauncher(config);
						launcher.WatchDemoAt(CurrentRound.Tick);
					},
					() => CurrentRound != null));
			}
		}

		/// <summary>
		/// Command to go to the next round
		/// </summary>
		public RelayCommand GoToNextRoundCommand
		{
			get
			{
				return _goToNextRoundCommand
					?? (_goToNextRoundCommand = new RelayCommand(
						async () =>
						{
							RoundNumber++;
							await LoadDatas();
						},
						() => RoundNumber < Demo.Rounds.Count));
			}
		}

		/// <summary>
		/// Command to go to the previous round
		/// </summary>
		public RelayCommand GoToPreviousRoundCommand
		{
			get
			{
				return _goToPreviousRound
					?? (_goToPreviousRound = new RelayCommand(
						async () =>
						{
							RoundNumber--;
							await LoadDatas();
						},
						() => RoundNumber > 1));
			}
		}

		public RelayCommand WindowLoaded
		{
			get
			{
				return _windowLoadedCommand
					?? (_windowLoadedCommand = new RelayCommand(
					async () =>
					{
						await LoadDatas();
					}));
			}
		}

		#endregion

		private async Task LoadDatas()
		{
			Demo.WeaponFired = await _cacheService.GetDemoWeaponFiredAsync(Demo);
			CurrentRound = Demo.Rounds.First(r => r.Number == RoundNumber);
			PeriodStart = DateTime.Today;
			PeriodEnd = DateTime.Today.AddSeconds(CurrentRound.Duration);
			VisibleStartTime = PeriodStart.AddSeconds(-5);
			VisibleEndTime = PeriodEnd.AddSeconds(5);
			RoundEventList = await _roundService.GetTimeLineEventList(Demo, CurrentRound);
			PlayersStats = await _playerService.GetPlayerRoundStatsListAsync(Demo, CurrentRound);
		}

		public RelayCommand<KillEvent> WatchKillCommand
		{
			get
			{
				return _watchKillCommand
					?? (_watchKillCommand = new RelayCommand<KillEvent>(
						async kill =>
						{
							if (AppSettings.SteamExePath() == null)
							{
								await _dialogService.ShowSteamNotFoundAsync();
								return;
							}
							GameLauncherConfiguration config = new GameLauncherConfiguration(Demo)
							{
								SteamExePath = AppSettings.SteamExePath(),
								Width = Settings.Default.ResolutionWidth,
								Height = Settings.Default.ResolutionHeight,
								Fullscreen = Settings.Default.IsFullscreen,
								EnableHlae = Settings.Default.EnableHlae,
								CsgoExePath = Settings.Default.CsgoExePath,
								EnableHlaeConfigParent = Settings.Default.EnableHlaeConfigParent,
								HlaeConfigParentFolderPath = Settings.Default.HlaeConfigParentFolderPath,
								HlaeExePath = HlaeService.GetHlaeExePath(),
								LaunchParameters = Settings.Default.LaunchParameters,
								UseCustomActionsGeneration = Settings.Default.UseCustomActionsGeneration,
								FocusPlayerSteamId = kill.KillerSteamId,
							};
							GameLauncher launcher = new GameLauncher(config);
							launcher.WatchDemoAt(kill.Tick, true);
						}));
			}
		}

		public RoundDetailsViewModel(IDialogService dialogService, IRoundService rounderService, IPlayerService playerService, ICacheService cacheService)
		{
			_dialogService = dialogService;
			_roundService = rounderService;
			_playerService = playerService;
			_cacheService = cacheService;

			if (IsInDesignMode)
			{
				DispatcherHelper.Initialize();
				Application.Current.Dispatcher.Invoke(async () =>
				{
					Demo = await _cacheService.GetDemoDataFromCache(string.Empty);
					RoundNumber = 10;
					await LoadDatas();
				});
			}
		}
	}
}
