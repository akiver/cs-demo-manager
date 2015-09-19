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
	public class AccountStatsWeaponViewModel : ViewModelBase
	{
		#region Properties

		private readonly IDemosService _demosService;

		private RelayCommand _windowLoadedCommand;

		private RelayCommand _goToOverallCommand;

		private RelayCommand _backToHomeCommand;

		private RelayCommand _goToRankCommand;

		private RelayCommand _goToMapCommand;

		private bool _isBusy;

		private string _notificationMessage;

		#region Rifles properties
		private List<GenericPieData> _datasAk47;
		private List<GenericPieData> _datasM4A4;
		private List<GenericPieData> _datasM4A1;
		private List<GenericPieData> _datasFamas;
		private List<GenericPieData> _datasAug;
		private List<GenericPieData> _datasSg556;
		private List<GenericPieData> _datasGalilar;
		#endregion

		#region Snipers properties
		private List<GenericPieData> _datasAwp;
		private List<GenericPieData> _datasScar20;
		private List<GenericPieData> _datasScout;
		private List<GenericPieData> _datasG3Sg1;
		#endregion

		#region SMGs properties
		private List<GenericPieData> _datasBizon;
		private List<GenericPieData> _datasMp7;
		private List<GenericPieData> _datasMp9;
		private List<GenericPieData> _datasMac10;
		private List<GenericPieData> _datasP90;
		private List<GenericPieData> _datasUmp45;
		#endregion

		#region Heavy properties
		private List<GenericPieData> _datasNova;
		private List<GenericPieData> _datasXm1014;
		private List<GenericPieData> _datasSawedOff;
		private List<GenericPieData> _datasMag7;
		private List<GenericPieData> _datasM249;
		private List<GenericPieData> _datasNegev;
		#endregion

		#region Pistols properties
		private List<GenericPieData> _datasGlock;
		private List<GenericPieData> _datasUsp;
		private List<GenericPieData> _datasP2000;
		private List<GenericPieData> _datasTec9;
		private List<GenericPieData> _datasCz75;
		private List<GenericPieData> _datasDualElite;
		private List<GenericPieData> _datasDeagle;
		private List<GenericPieData> _datasFiveSeven;
		private List<GenericPieData> _datasP250;
		#endregion

		#region Equipment properties
		private List<GenericPieData> _datasheGrenade;
		private List<GenericPieData> _datasMolotov;
		private List<GenericPieData> _datasIncendiary;
		private List<GenericPieData> _datasTazer;
		private List<GenericPieData> _datasKnife;
		private int _decoyThrowedCount;
		private int _smokeThrowedCount;
		private int _flashbangThrowedCount;
		private int _heGrenadeThrowedCount;
		private int _molotovThrowedCount;
		private int _incendiaryThrowedCount;
		#endregion

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

		#region Rifles accessors
		public List<GenericPieData> DatasAk47
		{
			get { return _datasAk47; }
			set { Set(() => DatasAk47, ref _datasAk47, value); }
		}

		public List<GenericPieData> DatasM4A4
		{
			get { return _datasM4A4; }
			set { Set(() => DatasM4A4, ref _datasM4A4, value); }
		}

		public List<GenericPieData> DatasM4A1
		{
			get { return _datasM4A1; }
			set { Set(() => DatasM4A1, ref _datasM4A1, value); }
		}

		public List<GenericPieData> DatasFamas
		{
			get { return _datasFamas; }
			set { Set(() => DatasFamas, ref _datasFamas, value); }
		}

		public List<GenericPieData> DatasAug
		{
			get { return _datasAug; }
			set { Set(() => DatasAug, ref _datasAug, value); }
		}

		public List<GenericPieData> DatasGalilar
		{
			get { return _datasGalilar; }
			set { Set(() => DatasGalilar, ref _datasGalilar, value); }
		}

		public List<GenericPieData> DatasSg556
		{
			get { return _datasSg556; }
			set { Set(() => DatasSg556, ref _datasSg556, value); }
		}
		#endregion

		#region Snipers accessors
		public List<GenericPieData> DatasAwp
		{
			get { return _datasAwp; }
			set { Set(() => DatasAwp, ref _datasAwp, value); }
		}

		public List<GenericPieData> DatasScout
		{
			get { return _datasScout; }
			set { Set(() => DatasScout, ref _datasScout, value); }
		}

		public List<GenericPieData> DatasScar20
		{
			get { return _datasScar20; }
			set { Set(() => DatasScar20, ref _datasScar20, value); }
		}

		public List<GenericPieData> DatasG3Sg1
		{
			get { return _datasG3Sg1; }
			set { Set(() => DatasG3Sg1, ref _datasG3Sg1, value); }
		}
		#endregion

		#region SMGs accessors
		public List<GenericPieData> DatasMp7
		{
			get { return _datasMp7; }
			set { Set(() => DatasMp7, ref _datasMp7, value); }
		}

		public List<GenericPieData> DatasMp9
		{
			get { return _datasMp9; }
			set { Set(() => DatasMp9, ref _datasMp9, value); }
		}

		public List<GenericPieData> DatasP90
		{
			get { return _datasP90; }
			set { Set(() => DatasP90, ref _datasP90, value); }
		}

		public List<GenericPieData> DatasBizon
		{
			get { return _datasBizon; }
			set { Set(() => DatasBizon, ref _datasBizon, value); }
		}

		public List<GenericPieData> DatasMac10
		{
			get { return _datasMac10; }
			set { Set(() => DatasMac10, ref _datasMac10, value); }
		}

		public List<GenericPieData> DatasUmp45
		{
			get { return _datasUmp45; }
			set { Set(() => DatasUmp45, ref _datasUmp45, value); }
		}
		#endregion

		#region Heavy accessors
		public List<GenericPieData> DatasNova
		{
			get { return _datasNova; }
			set { Set(() => DatasNova, ref _datasNova, value); }
		}

		public List<GenericPieData> DatasXm1014
		{
			get { return _datasXm1014; }
			set { Set(() => DatasXm1014, ref _datasXm1014, value); }
		}

		public List<GenericPieData> DatasMag7
		{
			get { return _datasMag7; }
			set { Set(() => DatasMag7, ref _datasMag7, value); }
		}

		public List<GenericPieData> DatasSawedOff
		{
			get { return _datasSawedOff; }
			set { Set(() => DatasSawedOff, ref _datasSawedOff, value); }
		}

		public List<GenericPieData> DatasM249
		{
			get { return _datasM249; }
			set { Set(() => DatasM249, ref _datasM249, value); }
		}

		public List<GenericPieData> DatasNegev
		{
			get { return _datasNegev; }
			set { Set(() => DatasNegev, ref _datasNegev, value); }
		}
		#endregion

		#region Pistols accessors
		public List<GenericPieData> DatasGlock
		{
			get { return _datasGlock; }
			set { Set(() => DatasGlock, ref _datasGlock, value); }
		}

		public List<GenericPieData> DatasUsp
		{
			get { return _datasUsp; }
			set { Set(() => DatasUsp, ref _datasUsp, value); }
		}

		public List<GenericPieData> DatasP2000
		{
			get { return _datasP2000; }
			set { Set(() => DatasP2000, ref _datasP2000, value); }
		}

		public List<GenericPieData> DatasTec9
		{
			get { return _datasTec9; }
			set { Set(() => DatasTec9, ref _datasTec9, value); }
		}

		public List<GenericPieData> DatasDualElite
		{
			get { return _datasDualElite; }
			set { Set(() => DatasDualElite, ref _datasDualElite, value); }
		}

		public List<GenericPieData> DatasP250
		{
			get { return _datasP250; }
			set { Set(() => DatasP250, ref _datasP250, value); }
		}

		public List<GenericPieData> DatasFiveSeven
		{
			get { return _datasFiveSeven; }
			set { Set(() => DatasFiveSeven, ref _datasFiveSeven, value); }
		}

		public List<GenericPieData> DatasDeagle
		{
			get { return _datasDeagle; }
			set { Set(() => DatasDeagle, ref _datasDeagle, value); }
		}

		public List<GenericPieData> DatasCz75
		{
			get { return _datasCz75; }
			set { Set(() => DatasCz75, ref _datasCz75, value); }
		}
		#endregion

		#region Equipment Accessors
		public List<GenericPieData> DatasHeGrenade
		{
			get { return _datasheGrenade; }
			set { Set(() => DatasHeGrenade, ref _datasheGrenade, value); }
		}

		public List<GenericPieData> DatasMolotov
		{
			get { return _datasMolotov; }
			set { Set(() => DatasMolotov, ref _datasMolotov, value); }
		}

		public List<GenericPieData> DatasIncendiary
		{
			get { return _datasIncendiary; }
			set { Set(() => DatasIncendiary, ref _datasIncendiary, value); }
		}

		public List<GenericPieData> DatasTazer
		{
			get { return _datasTazer; }
			set { Set(() => DatasTazer, ref _datasTazer, value); }
		}

		public List<GenericPieData> DatasKnife
		{
			get { return _datasKnife; }
			set { Set(() => DatasKnife, ref _datasKnife, value); }
		}

		public int DecoyThrowedCount
		{
			get { return _decoyThrowedCount; }
			set { Set(() => DecoyThrowedCount, ref _decoyThrowedCount, value); }
		}

		public int FlashbangThrowedCount
		{
			get { return _flashbangThrowedCount; }
			set { Set(() => FlashbangThrowedCount, ref _flashbangThrowedCount, value); }
		}

		public int SmokeThrowedCount
		{
			get { return _smokeThrowedCount; }
			set { Set(() => SmokeThrowedCount, ref _smokeThrowedCount, value); }
		}

		public int HeGrenadeThrowedCount
		{
			get { return _heGrenadeThrowedCount; }
			set { Set(() => HeGrenadeThrowedCount, ref _heGrenadeThrowedCount, value); }
		}

		public int MolotovThrowedCount
		{
			get { return _molotovThrowedCount; }
			set { Set(() => MolotovThrowedCount, ref _molotovThrowedCount, value); }
		}

		public int IncendiaryThrowedCount
		{
			get { return _incendiaryThrowedCount; }
			set { Set(() => IncendiaryThrowedCount, ref _incendiaryThrowedCount, value); }
		}
		#endregion

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

		#endregion

		private async Task LoadDatas()
		{
			WeaponStats datas = await _demosService.GetWeaponStatsAsync();

			DatasAk47 = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillAk47Count
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathAk47Count
				}
			};
			DatasM4A4 = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillM4A4Count
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathM4A4Count
				},
			};
			DatasM4A1 = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillM4A1Count
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathM4A1Count
				},
			};
			DatasAug = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillAugCount
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathAugCount
				},
			};
			DatasGalilar = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillGalilarCount
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathGalilarCount
				},
			};
			DatasSg556 = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillSg556Count
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathSg556Count
				},
			};
			DatasFamas = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillFamasCount
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathFamasCount
				},
			};

			// Snipers
			DatasAwp = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillAwpCount
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathAwpCount
				},
			};

			DatasScar20 = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillScar20Count
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathScar20Count
				},
			};

			DatasG3Sg1 = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillG3Sg1Count
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathG3Ssg1Count
				},
			};

			DatasScout = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillScoutCount
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathScoutCount
				},
			};

			// SMGs
			DatasMp7 = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillMp7Count
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathMp7Count
				},
			};

			DatasMp9 = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillMp9Count
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathMp9Count
				},
			};
			DatasP90 = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillP90Count
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathP90Count
				},
			};
			DatasBizon = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillBizonCount
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathBizonCount
				},
			};
			DatasMac10 = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillMac10Count
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathMac10Count
				},
			};
			DatasUmp45 = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillUmp45Count
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathUmp45Count
				},
			};

			// Heavy
			DatasNova = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillNovaCount
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathNovaCount
				},
			};
			DatasXm1014 = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillXm1014Count
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathXm1014Count
				},
			};
			DatasMag7 = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillMag7Count
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathMag7Count
				},
			};
			DatasSawedOff = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillSawedOffCount
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathSawedOffCount
				},
			};
			DatasM249 = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillM249Count
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathM249Count
				},
			};
			DatasNegev = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillNegevCount
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathNegevCount
				},
			};

			// Pistols
			DatasGlock = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillGlockCount
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathGlockCount
				},
			};
			DatasUsp = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillUspCount
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathUspCount
				},
			};
			DatasP2000 = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillP2000Count
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathP2000Count
				},
			};
			DatasP250 = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillP250Count
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathP250Count
				},
			};
			DatasTec9 = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillTec9Count
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.KillTec9Count
				},
			};
			DatasDeagle = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillDeagleCount
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathDeagleCount
				},
			};
			DatasFiveSeven = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillFiveSevenCount
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathFiveSevenCount
				},
			};
			DatasDualElite = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillDualEliteCount
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathDualEliteCount
				},
			};
			DatasCz75 = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillCz75Count
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathCz75Count
				},
			};

			// Equipement
			DatasHeGrenade = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillHeGrenadeCount
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathHeGrenadeCount
				},
			};
			DatasMolotov = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillMolotovCount
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathMolotovCount
				},
			};
			DatasIncendiary = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillIncendiaryCount
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathIncendiaryCount
				},
			};
			DatasTazer = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillTazerCount
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathTazerCount
				},
			};
			DatasKnife = new List<GenericPieData>
			{
				new GenericPieData
				{
					Category = "Kills",
					Value = datas.KillKnifeCount
				},
				new GenericPieData
				{
					Category = "Deaths",
					Value = datas.DeathKnifeCount
				},
			};
			SmokeThrowedCount = datas.SmokeThrowedCount;
			DecoyThrowedCount = datas.DecoyThrowedCount;
			FlashbangThrowedCount = datas.FlashbangThrowedCount;
			HeGrenadeThrowedCount = datas.HeGrenadeThrowedCount;
			MolotovThrowedCount = datas.MolotovThrowedCount;
			IncendiaryThrowedCount = datas.IncendiaryThrowedCount;
		}

		public AccountStatsWeaponViewModel(IDemosService demoService)
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
			HeGrenadeThrowedCount = 0;
			IncendiaryThrowedCount = 0;
			MolotovThrowedCount = 0;
			DecoyThrowedCount = 0;
			SmokeThrowedCount = 0;
			FlashbangThrowedCount = 0;
			DatasAk47 = null;
			DatasM249 = null;
			DatasAug = null;
			DatasAwp = null;
			DatasBizon = null;
			DatasCz75 = null;
			DatasDeagle = null;
			DatasDualElite = null;
			DatasFamas = null;
			DatasFiveSeven = null;
			DatasG3Sg1 = null;
			DatasGalilar = null;
			DatasGlock = null;
			DatasHeGrenade = null;
			DatasIncendiary = null;
			DatasKnife = null;
			DatasM4A1 = null;
			DatasM4A4 = null;
			DatasMp7 = null;
			DatasMp9 = null;
			DatasP250 = null;
			DatasP2000 = null;
			DatasP90 = null;
			DatasUsp = null;
			DatasUmp45 = null;
			DatasSg556 = null;
			DatasNegev = null;
			DatasMac10 = null;
			DatasNova = null;
			DatasMag7 = null;
			DatasXm1014 = null;
			DatasTazer = null;
			DatasTec9 = null;
			DatasMolotov = null;
			DatasSawedOff = null;
			DatasScar20 = null;
			DatasScout = null;
		}
	}
}