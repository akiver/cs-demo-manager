using System.Collections.Generic;
using System.Threading.Tasks;
using System.Windows;
using CSGO_Demos_Manager.Messages;
using CSGO_Demos_Manager.Models.Charts;
using CSGO_Demos_Manager.Models.Stats;
using CSGO_Demos_Manager.Services.Interfaces;
using CSGO_Demos_Manager.Views;
using CSGO_Demos_Manager.Views.AccountStats;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using GalaSoft.MvvmLight.Messaging;
using GalaSoft.MvvmLight.Threading;

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

		private List<GenericDoubleChart> _dust2PieDatas;

		private List<GenericDoubleChart> _infernoPieDatas;

		private List<GenericDoubleChart> _miragePieDatas;

		private List<GenericDoubleChart> _nukePieDatas;

		private List<GenericDoubleChart> _cobblestonePieDatas;

		private List<GenericDoubleChart> _overpassPieDatas;

		private List<GenericDoubleChart> _cachePieDatas;

		private List<GenericDoubleChart> _trainPieDatas;

		private List<GenericDoubleChart> _dust2PercentageDatas;

		private List<GenericDoubleChart> _miragePercentageDatas;

		private List<GenericDoubleChart> _infernoPercentageDatas;

		private List<GenericDoubleChart> _nukePercentageDatas;

		private List<GenericDoubleChart> _overpassPercentageDatas;

		private List<GenericDoubleChart> _cobblestonePercentageDatas;

		private List<GenericDoubleChart> _trainPercentageDatas;

		private List<GenericDoubleChart> _cachePercentageDatas;

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

		public List<GenericDoubleChart> Dust2PieDatas
		{
			get { return _dust2PieDatas; }
			set { Set(() => Dust2PieDatas, ref _dust2PieDatas, value); }
		}

		public List<GenericDoubleChart> InfernoPieDatas
		{
			get { return _infernoPieDatas; }
			set { Set(() => InfernoPieDatas, ref _infernoPieDatas, value); }
		}

		public List<GenericDoubleChart> MiragePieDatas
		{
			get { return _miragePieDatas; }
			set { Set(() => MiragePieDatas, ref _miragePieDatas, value); }
		}

		public List<GenericDoubleChart> CobblestonePieDatas
		{
			get { return _cobblestonePieDatas; }
			set { Set(() => CobblestonePieDatas, ref _cobblestonePieDatas, value); }
		}

		public List<GenericDoubleChart> CachePieDatas
		{
			get { return _cachePieDatas; }
			set { Set(() => CachePieDatas, ref _cachePieDatas, value); }
		}

		public List<GenericDoubleChart> TrainPieDatas
		{
			get { return _trainPieDatas; }
			set { Set(() => TrainPieDatas, ref _trainPieDatas, value); }
		}

		public List<GenericDoubleChart> NukePieDatas
		{
			get { return _nukePieDatas; }
			set { Set(() => NukePieDatas, ref _nukePieDatas, value); }
		}

		public List<GenericDoubleChart> OverpassPieDatas
		{
			get { return _overpassPieDatas; }
			set { Set(() => OverpassPieDatas, ref _overpassPieDatas, value); }
		}

		public List<GenericDoubleChart> Dust2PercentDatas
		{
			get { return _dust2PercentageDatas; }
			set { Set(() => Dust2PercentDatas, ref _dust2PercentageDatas, value); }
		}

		public List<GenericDoubleChart> MiragePercentDatas
		{
			get { return _miragePercentageDatas; }
			set { Set(() => MiragePercentDatas, ref _miragePercentageDatas, value); }
		}

		public List<GenericDoubleChart> InfernoPercentDatas
		{
			get { return _infernoPercentageDatas; }
			set { Set(() => InfernoPercentDatas, ref _infernoPercentageDatas, value); }
		}

		public List<GenericDoubleChart> TrainPercentDatas
		{
			get { return _trainPercentageDatas; }
			set { Set(() => TrainPercentDatas, ref _trainPercentageDatas, value); }
		}

		public List<GenericDoubleChart> CachePercentDatas
		{
			get { return _cachePercentageDatas; }
			set { Set(() => CachePercentDatas, ref _cachePercentageDatas, value); }
		}

		public List<GenericDoubleChart> CobblestonePercentDatas
		{
			get { return _cobblestonePercentageDatas; }
			set { Set(() => CobblestonePercentDatas, ref _cobblestonePercentageDatas, value); }
		}

		public List<GenericDoubleChart> OverpassPercentDatas
		{
			get { return _overpassPercentageDatas; }
			set { Set(() => OverpassPercentDatas, ref _overpassPercentageDatas, value); }
		}

		public List<GenericDoubleChart> NukePercentDatas
		{
			get { return _nukePercentageDatas; }
			set { Set(() => NukePercentDatas, ref _nukePercentageDatas, value); }
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
						Messenger.Default.Register<SettingsFlyoutClosed>(this, HandleSettingsFlyoutClosedMessage);
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
			IsBusy = true;
			NotificationMessage = "Loading...";
			MapStats datas = await _demosService.GetMapStatsAsync();

			Dust2PieDatas = new List<GenericDoubleChart>
			{
				new GenericDoubleChart
				{
					Label = "Win",
					Value = datas.Dust2WinCount
				},
				new GenericDoubleChart
				{
					Label = "Loss",
					Value = datas.Dust2LossCount
				},
				new GenericDoubleChart
				{
					Label = "Draw",
					Value = datas.Dust2DrawCount
				}
			};

			InfernoPieDatas = new List<GenericDoubleChart>
			{
				new GenericDoubleChart
				{
					Label = "Win",
					Value = datas.InfernoWinCount
				},
				new GenericDoubleChart
				{
					Label = "Loss",
					Value = datas.InfernoLossCount
				},
				new GenericDoubleChart
				{
					Label = "Draw",
					Value = datas.InfernoDrawCount
				}
			};

			MiragePieDatas = new List<GenericDoubleChart>
			{
				new GenericDoubleChart
				{
					Label = "Win",
					Value = datas.MirageWinCount
				},
				new GenericDoubleChart
				{
					Label = "Loss",
					Value = datas.MirageLossCount
				},
				new GenericDoubleChart
				{
					Label = "Draw",
					Value = datas.MirageDrawCount
				}
			};

			NukePieDatas = new List<GenericDoubleChart>
			{
				new GenericDoubleChart
				{
					Label = "Win",
					Value = datas.NukeWinCount
				},
				new GenericDoubleChart
				{
					Label = "Loss",
					Value = datas.NukeLossCount
				},
				new GenericDoubleChart
				{
					Label = "Draw",
					Value = datas.NukeDrawCount
				}
			};

			TrainPieDatas = new List<GenericDoubleChart>
			{
				new GenericDoubleChart
				{
					Label = "Win",
					Value = datas.TrainWinCount
				},
				new GenericDoubleChart
				{
					Label = "Loss",
					Value = datas.TrainLossCount
				},
				new GenericDoubleChart
				{
					Label = "Draw",
					Value = datas.TrainDrawCount
				}
			};

			OverpassPieDatas = new List<GenericDoubleChart>
			{
				new GenericDoubleChart
				{
					Label = "Win",
					Value = datas.OverpassWinCount
				},
				new GenericDoubleChart
				{
					Label = "Loss",
					Value = datas.OverpassLossCount
				},
				new GenericDoubleChart
				{
					Label = "Draw",
					Value = datas.OverpassDrawCount
				}
			};

			CachePieDatas = new List<GenericDoubleChart>
			{
				new GenericDoubleChart
				{
					Label = "Win",
					Value = datas.CacheWinCount
				},
				new GenericDoubleChart
				{
					Label = "Loss",
					Value = datas.CacheLossCount
				},
				new GenericDoubleChart
				{
					Label = "Draw",
					Value = datas.CacheDrawCount
				}
			};

			CobblestonePieDatas = new List<GenericDoubleChart>
			{
				new GenericDoubleChart
				{
					Label = "Win",
					Value = datas.CobblestoneWinCount
				},
				new GenericDoubleChart
				{
					Label = "Loss",
					Value = datas.CobblestoneLossCount
				},
				new GenericDoubleChart
				{
					Label = "Draw",
					Value = datas.CobblestoneDrawCount
				}
			};

			Dust2PercentDatas = new List<GenericDoubleChart>
			{
				new GenericDoubleChart
				{
					Label = "Dust2",
					Value = (float) datas.Dust2WinPercentage
				}
			};

			MiragePercentDatas = new List<GenericDoubleChart>
			{
				new GenericDoubleChart
				{
					Label = "Mirage",
					Value = (float) datas.MirageWinPercentage
				}
			};

			InfernoPercentDatas = new List<GenericDoubleChart>
			{
				new GenericDoubleChart
				{
					Label = "Inferno",
					Value = (float) datas.InfernoWinPercentage
				}
			};

			NukePercentDatas = new List<GenericDoubleChart>
			{
				new GenericDoubleChart
				{
					Label = "Nuke",
					Value = (float) datas.NukeWinPercentage
				}
			};

			OverpassPercentDatas = new List<GenericDoubleChart>
			{
				new GenericDoubleChart
				{
					Label = "Overpass",
					Value = (float) datas.OverpassWinPercentage
				}
			};

			CobblestonePercentDatas = new List<GenericDoubleChart>
			{
				new GenericDoubleChart
				{
					Label = "Cobblestone",
					Value = (float) datas.CobblestoneWinPercentage
				}
			};

			CachePercentDatas = new List<GenericDoubleChart>
			{
				new GenericDoubleChart
				{
					Label = "Cache",
					Value = (float) datas.CacheWinPercentage
				}
			};

			TrainPercentDatas = new List<GenericDoubleChart>
			{
				new GenericDoubleChart
				{
					Label = "Train",
					Value = (float) datas.TrainWinPercentage
				}
			};
			IsBusy = false;
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

		private void HandleSettingsFlyoutClosedMessage(SettingsFlyoutClosed msg)
		{
			DispatcherHelper.CheckBeginInvokeOnUI(
				async () =>
				{
					await LoadDatas();
				});
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
			Dust2PercentDatas = null;
			MiragePercentDatas = null;
			InfernoPercentDatas = null;
			NukePercentDatas = null;
			OverpassPercentDatas = null;
			CobblestonePercentDatas = null;
			TrainPercentDatas = null;
			CachePercentDatas = null;
		}
	}
}