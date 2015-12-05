using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Stats;
using CSGO_Demos_Manager.Services.Interfaces;
using CSGO_Demos_Manager.Views;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;

namespace CSGO_Demos_Manager.ViewModel
{
	public class DemoFlashbangsViewModel : ViewModelBase
	{
		#region Properties

		private bool _isBusy;

		private string _notificationMessage;

		private Demo _currentDemo;

		private readonly IFlashbangService _flashbangService;

		private RelayCommand<Demo> _backToDemoDetailsCommand;

		private RelayCommand _windowLoadedCommand;

		/// <summary>
		/// Contains all heatmap point used for flash times by player
		/// </summary>
		private List<FlashbangDataPoint> _playersFlashTimes;

		/// <summary>
		/// Contains all heatmap point used for flash times by team
		/// </summary>
		private List<FlashbangDataPoint> _teamsFlashTimes;

		/// <summary>
		/// Contains all heatmap point used for average flash times by player
		/// </summary>
		private List<FlashbangDataPoint> _averagePlayersFlashTimes;

		/// <summary>
		/// Max flash duration for the heatmap by player
		/// </summary>
		private decimal _maxDurationPlayer;

		/// <summary>
		/// Max flash duration for the heatmap by team
		/// </summary>
		private decimal _maxDurationTeam;

		/// <summary>
		/// Max average flash duration for the heatmap AVG by player
		/// </summary>
		private decimal _maxDurationAveragePlayer;

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

		public Demo CurrentDemo
		{
			get { return _currentDemo; }
			set { Set(() => CurrentDemo, ref _currentDemo, value); }
		}

		public List<FlashbangDataPoint> PlayersFlashTimes
		{
			get { return _playersFlashTimes; }
			set { Set(() => PlayersFlashTimes, ref _playersFlashTimes, value); }
		}

		public List<FlashbangDataPoint> TeamsFlashTimes
		{
			get { return _teamsFlashTimes; }
			set { Set(() => TeamsFlashTimes, ref _teamsFlashTimes, value); }
		}

		public List<FlashbangDataPoint> AverageFlashTimesPlayers
		{
			get { return _averagePlayersFlashTimes; }
			set { Set(() => AverageFlashTimesPlayers, ref _averagePlayersFlashTimes, value); }
		}

		public List<TeamExtended> Teams
		{
			get
			{
				List<TeamExtended> teams = new List<TeamExtended>
				{
					_currentDemo.TeamCT,
					_currentDemo.TeamT
				};
				return teams;
			}
		}

		public decimal MaxDurationPlayer
		{
			get { return _maxDurationPlayer; }
			set { Set(() => MaxDurationPlayer, ref _maxDurationPlayer, value); }
		}

		public decimal MaxDurationTeam
		{
			get { return _maxDurationTeam; }
			set { Set(() => MaxDurationTeam, ref _maxDurationTeam, value); }
		}

		public decimal MaxDurationAveragePlayer
		{
			get { return _maxDurationAveragePlayer; }
			set { Set(() => MaxDurationAveragePlayer, ref _maxDurationAveragePlayer, value); }
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
						await LoadDatas();
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
							var detailsViewModel = (new ViewModelLocator()).Details;
							detailsViewModel.CurrentDemo = demo;
							var mainViewModel = (new ViewModelLocator()).Main;
							DetailsView detailsView = new DetailsView();
							mainViewModel.CurrentPage.ShowPage(detailsView);
							Cleanup();
						},
						demo => CurrentDemo != null));
			}
		}

		#endregion

		public DemoFlashbangsViewModel(IFlashbangService flashbangService)
		{
			_flashbangService = flashbangService;

			if (IsInDesignMode)
			{
				Application.Current.Dispatcher.Invoke(async () =>
				{
					await LoadDatas();
				});
			}
		}

		private async Task LoadDatas()
		{
			IsBusy = true;
			NotificationMessage = "Loading...";
			_flashbangService.Demo = CurrentDemo;
			PlayersFlashTimes = await _flashbangService.GetPlayersFlashTimesData();
			if (PlayersFlashTimes.Any()) MaxDurationPlayer = PlayersFlashTimes.Max(p => p.Duration);
			TeamsFlashTimes = await _flashbangService.GetTeamsFlashTimesData();
			if (TeamsFlashTimes.Any()) MaxDurationTeam = TeamsFlashTimes.Max(p => p.Duration);
			AverageFlashTimesPlayers = await _flashbangService.GetAverageFlashTimesPlayersData();
			if (AverageFlashTimesPlayers.Any()) MaxDurationAveragePlayer = AverageFlashTimesPlayers.Max(p => p.Duration);
			IsBusy = false;
		}

		public override void Cleanup()
		{
			base.Cleanup();
			PlayersFlashTimes.Clear();
			TeamsFlashTimes.Clear();
			AverageFlashTimesPlayers.Clear();
			MaxDurationAveragePlayer = 0;
			MaxDurationPlayer = 0;
			MaxDurationTeam = 0;
		}
	}
}
