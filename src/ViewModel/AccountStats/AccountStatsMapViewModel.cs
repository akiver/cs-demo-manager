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
	public class AccountStatsMapViewModel : ViewModelBase
	{
		#region Properties

		private readonly IDemosService _demosService;

		private RelayCommand _windowLoadedCommand;

		private RelayCommand _backToHomeCommand;

		private RelayCommand _goToRankCommand;

		private RelayCommand _goToOverallCommand;

		private RelayCommand _goToWeaponCommand;

		private RelayCommand _goToProgressCommand;

		private bool _isBusy;

		private string _notificationMessage;

		private List<GenericPieData> _dust2PieDatas;

		private List<GenericPieData> _infernoPieDatas;

		private List<GenericPieData> _miragePieDatas;

		private List<GenericPieData> _nukePieDatas;

		private List<GenericPieData> _cobblestonePieDatas;

		private List<GenericPieData> _overpassPieDatas;

		private List<GenericPieData> _cachePieDatas;

		private List<GenericPieData> _trainPieDatas;

		private List<GenericPieData> _mapPercentageDatas;

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

		public List<GenericPieData> Dust2PieDatas
		{
			get { return _dust2PieDatas; }
			set { Set(() => Dust2PieDatas, ref _dust2PieDatas, value); }
		}

		public List<GenericPieData> InfernoPieDatas
		{
			get { return _infernoPieDatas; }
			set { Set(() => InfernoPieDatas, ref _infernoPieDatas, value); }
		}

		public List<GenericPieData> MiragePieDatas
		{
			get { return _miragePieDatas; }
			set { Set(() => MiragePieDatas, ref _miragePieDatas, value); }
		}

		public List<GenericPieData> CobblestonePieDatas
		{
			get { return _cobblestonePieDatas; }
			set { Set(() => CobblestonePieDatas, ref _cobblestonePieDatas, value); }
		}

		public List<GenericPieData> CachePieDatas
		{
			get { return _cachePieDatas; }
			set { Set(() => CachePieDatas, ref _cachePieDatas, value); }
		}

		public List<GenericPieData> TrainPieDatas
		{
			get { return _trainPieDatas; }
			set { Set(() => TrainPieDatas, ref _trainPieDatas, value); }
		}

		public List<GenericPieData> NukePieDatas
		{
			get { return _nukePieDatas; }
			set { Set(() => NukePieDatas, ref _nukePieDatas, value); }
		}

		public List<GenericPieData> OverpassPieDatas
		{
			get { return _overpassPieDatas; }
			set { Set(() => OverpassPieDatas, ref _overpassPieDatas, value); }
		}

		public List<GenericPieData> MapPercentDatas
		{
			get { return _mapPercentageDatas; }
			set { Set(() => MapPercentDatas, ref _mapPercentageDatas, value); }
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
						var mainViewModel = (new ViewModelLocator()).Main;
						Application.Current.Properties["LastPageViewed"] = mainViewModel.CurrentPage.CurrentPage;
						ProgressView progressView = new ProgressView();
						mainViewModel.CurrentPage.ShowPage(progressView);
						Cleanup();
					}));
			}
		}

		#endregion

		private async Task LoadDatas()
		{
			MapStats datas = await _demosService.GetMapStatsAsync();

			Dust2PieDatas = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Win",
					Value = datas.Dust2WinCount
				},
				new GenericPieData
				{
					Category = "Loss",
					Value = datas.Dust2LossCount
				},
				new GenericPieData
				{
					Category = "Draw",
					Value = datas.Dust2DrawCount
				}
			};

			InfernoPieDatas = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Win",
					Value = datas.InfernoWinCount
				},
				new GenericPieData
				{
					Category = "Loss",
					Value = datas.InfernoLossCount
				},
				new GenericPieData
				{
					Category = "Draw",
					Value = datas.InfernoDrawCount
				}
			};

			MiragePieDatas = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Win",
					Value = datas.MirageWinCount
				},
				new GenericPieData
				{
					Category = "Loss",
					Value = datas.MirageLossCount
				},
				new GenericPieData
				{
					Category = "Draw",
					Value = datas.MirageDrawCount
				}
			};

			NukePieDatas = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Win",
					Value = datas.NukeWinCount
				},
				new GenericPieData
				{
					Category = "Loss",
					Value = datas.NukeLossCount
				},
				new GenericPieData
				{
					Category = "Draw",
					Value = datas.NukeDrawCount
				}
			};

			TrainPieDatas = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Win",
					Value = datas.TrainWinCount
				},
				new GenericPieData
				{
					Category = "Loss",
					Value = datas.TrainLossCount
				},
				new GenericPieData
				{
					Category = "Draw",
					Value = datas.TrainDrawCount
				}
			};

			OverpassPieDatas = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Win",
					Value = datas.OverpassWinCount
				},
				new GenericPieData
				{
					Category = "Loss",
					Value = datas.OverpassLossCount
				},
				new GenericPieData
				{
					Category = "Draw",
					Value = datas.OverpassDrawCount
				}
			};

			CachePieDatas = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Win",
					Value = datas.CacheWinCount
				},
				new GenericPieData
				{
					Category = "Loss",
					Value = datas.CacheLossCount
				},
				new GenericPieData
				{
					Category = "Draw",
					Value = datas.CacheDrawCount
				}
			};

			CobblestonePieDatas = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Win",
					Value = datas.CobblestoneWinCount
				},
				new GenericPieData
				{
					Category = "Loss",
					Value = datas.CobblestoneLossCount
				},
				new GenericPieData
				{
					Category = "Draw",
					Value = datas.CobblestoneDrawCount
				}
			};

			MapPercentDatas = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Dust2",
					Value = (float) datas.Dust2WinPercentage
				},
				new GenericPieData
				{
					Category = "Inferno",
					Value = (float) datas.InfernoWinPercentage
				},
				new GenericPieData
				{
					Category = "Mirage",
					Value = (float) datas.MirageWinPercentage
				},
				new GenericPieData
				{
					Category = "Cache",
					Value = (float) datas.CacheWinPercentage
				},
				new GenericPieData
				{
					Category = "Overpass",
					Value = (float) datas.OverpassWinPercentage
				},
				new GenericPieData
				{
					Category = "Cobblestone",
					Value = (float) datas.CobblestoneWinPercentage
				},
				new GenericPieData
				{
					Category = "Train",
					Value = (float) datas.TrainWinPercentage
				},
				new GenericPieData
				{
					Category = "Nuke",
					Value = (float) datas.NukeWinPercentage
				},
			};
		}

		public AccountStatsMapViewModel(IDemosService demosService)
		{
			_demosService = demosService;

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
			CachePieDatas = null;
			CobblestonePieDatas = null;
			Dust2PieDatas = null;
			InfernoPieDatas = null;
			MiragePieDatas = null;
			NukePieDatas = null;
			OverpassPieDatas = null;
			TrainPieDatas = null;
			MapPercentDatas = null;
		}
	}
}