using System.Collections.Generic;
using System.Threading.Tasks;
using System.Windows;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Charts;
using CSGO_Demos_Manager.Services;
using CSGO_Demos_Manager.Views;
using CSGO_Demos_Manager.Views.AccountStats;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;

namespace CSGO_Demos_Manager.ViewModel.AccountStats
{
	public class AccountStatsGeneralViewModel : ViewModelBase
	{
		#region Properties

		private readonly IDemosService _demosService;

		private RelayCommand _windowLoadedCommand;

		private RelayCommand _backToHomeCommand;

		private RelayCommand _goToRankCommand;

		private bool _isBusy;

		private string _notificationMessage;

		private List<GenericPieData> _datasMatchStats;

		private object _selectedItem;

		private int _matchCount;

		private int _killCount;

		private int _assistCount;

		private int _deathCount;

		private int _headshotCount;

		private decimal _killDeathRatio;

		private decimal _headshotRatio;

		private int _entryKillCount;

		private int _knifeKillCount;

		private int _fiveKillCount;

		private int _fourKillCount;

		private int _threeKillCount;

		private int _twoKillCount;

		private int _bombPlantedCount;

		private int _bombDefusedCount;

		private int _bombExplodedCount;

		private int _mvpCount;

		private int _damageCount;

		#endregion

		#region Accessors

		public List<GenericPieData> DatasMatchStats
		{
			get { return _datasMatchStats; }
			set { Set(() => DatasMatchStats, ref _datasMatchStats, value); }
		}

		public object SelectedItem
		{
			get { return _selectedItem; }
			set { Set(() => SelectedItem, ref _selectedItem, value); }
		}

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

		public int MatchCount
		{
			get { return _matchCount; }
			set { Set(() => MatchCount, ref _matchCount, value); }
		}

		public int KillCount
		{
			get { return _killCount; }
			set { Set(() => KillCount, ref _killCount, value); }
		}

		public int AssistCount
		{
			get { return _assistCount; }
			set { Set(() => AssistCount, ref _assistCount, value); }
		}

		public int DeathCount
		{
			get { return _deathCount; }
			set { Set(() => DeathCount, ref _deathCount, value); }
		}

		public int HeadshotCount
		{
			get { return _headshotCount; }
			set { Set(() => HeadshotCount, ref _headshotCount, value); }
		}

		public decimal HeadshotRatio
		{
			get { return _headshotRatio; }
			set { Set(() => HeadshotRatio, ref _headshotRatio, value); }
		}

		public decimal KillDeathRatio
		{
			get { return _killDeathRatio; }
			set { Set(() => KillDeathRatio, ref _killDeathRatio, value); }
		}

		public int EntryKillCount
		{
			get { return _entryKillCount; }
			set { Set(() => EntryKillCount, ref _entryKillCount, value); }
		}

		public int KnifeKillCount
		{
			get { return _knifeKillCount; }
			set { Set(() => KnifeKillCount, ref _knifeKillCount, value); }
		}

		public int FiveKillCount
		{
			get { return _fiveKillCount; }
			set { Set(() => FiveKillCount, ref _fiveKillCount, value); }
		}

		public int FourKillCount
		{
			get { return _fourKillCount; }
			set { Set(() => FourKillCount, ref _fourKillCount, value); }
		}

		public int ThreeKillCount
		{
			get { return _threeKillCount; }
			set { Set(() => ThreeKillCount, ref _threeKillCount, value); }
		}

		public int TwoKillCount
		{
			get { return _twoKillCount; }
			set { Set(() => TwoKillCount, ref _twoKillCount, value); }
		}

		public int BombPlantedCount
		{
			get { return _bombPlantedCount; }
			set { Set(() => BombPlantedCount, ref _bombPlantedCount, value); }
		}

		public int BombExplodedCount
		{
			get { return _bombExplodedCount; }
			set { Set(() => BombExplodedCount, ref _bombExplodedCount, value); }
		}

		public int BombDefusedCount
		{
			get { return _bombDefusedCount; }
			set { Set(() => BombDefusedCount, ref _bombDefusedCount, value); }
		}

		public int MvpCount
		{
			get { return _mvpCount; }
			set { Set(() => MvpCount, ref _mvpCount, value); }
		}

		public int DamageCount
		{
			get { return _damageCount; }
			set { Set(() => DamageCount, ref _damageCount, value); }
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
					}));
			}
		}

		#endregion

		private async Task LoadDatas()
		{
			OverallStats datas = await _demosService.GetGeneralAccountStatsAsync();
			MatchCount = datas.MatchCount;
			KillCount = datas.KillCount;
			AssistCount = datas.AssistCount;
			DeathCount = datas.DeathCount;
			HeadshotCount = datas.HeadshotCount;
			HeadshotRatio = datas.HeadshotRatio;
			KnifeKillCount = datas.KnifeKillCount;
			FiveKillCount = datas.FiveKillCount;
			FourKillCount = datas.FourKillCount;
			ThreeKillCount = datas.ThreeKillCount;
			TwoKillCount = datas.TwoKillCount;
			EntryKillCount = datas.EntryKillCount;
			KillDeathRatio = datas.KillDeathRatio;
			BombDefusedCount = datas.BombDefusedCount;
			BombExplodedCount = datas.BombExplodedCount;
			BombPlantedCount = datas.BombPlantedCount;
			MvpCount = datas.MvpCount;
			DamageCount = datas.DamageCount;
			DatasMatchStats = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Win",
					Value = datas.MatchWinCount
				},
				new GenericPieData
				{
					Category = "Loss",
					Value = datas.MatchLossCount
				},
				new GenericPieData
				{
					Category = "Draw",
					Value = datas.MatchDrawCount
				}
			};
		}

		public AccountStatsGeneralViewModel(IDemosService demoService)
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
	}
}