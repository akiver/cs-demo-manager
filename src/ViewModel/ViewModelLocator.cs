using CSGO_Demos_Manager.Services;
using CSGO_Demos_Manager.Services.Design;
using CSGO_Demos_Manager.Services.Excel;
using CSGO_Demos_Manager.Services.Interfaces;
using CSGO_Demos_Manager.ViewModel.AccountStats;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.Ioc;
using Microsoft.Practices.ServiceLocation;

namespace CSGO_Demos_Manager.ViewModel
{
	public class ViewModelLocator
	{
		public ViewModelLocator()
		{
			ServiceLocator.SetLocatorProvider(() => SimpleIoc.Default);

			SimpleIoc.Default.Register<DialogService, DialogService>();

			if (ViewModelBase.IsInDesignModeStatic)
			{
				// Create design time view services and models
				SimpleIoc.Default.Register<IDemosService, DemosDesignService>();
				SimpleIoc.Default.Register<ISteamService, SteamServiceDesign>();
				SimpleIoc.Default.Register<ICacheService, CacheDesignService>();
				SimpleIoc.Default.Register<ExcelService, ExcelService>();
				SimpleIoc.Default.Register<IFlashbangService, FlashbangServiceDesign>();
				SimpleIoc.Default.Register<IKillService, KillServiceDesign>();
			}
			else
			{
				// Create run time view services and models
				SimpleIoc.Default.Register<IDemosService, DemosService>();
				SimpleIoc.Default.Register<ISteamService, SteamService>();
				SimpleIoc.Default.Register<ICacheService, CacheService>();
				SimpleIoc.Default.Register<ExcelService, ExcelService>();
				SimpleIoc.Default.Register<IFlashbangService, FlashbangService>();
				SimpleIoc.Default.Register<IKillService, KillService>();
			}

			SimpleIoc.Default.Register<MainViewModel>();
			SimpleIoc.Default.Register<HomeViewModel>();
			SimpleIoc.Default.Register<SettingsViewModel>();
			SimpleIoc.Default.Register<DetailsViewModel>();
			SimpleIoc.Default.Register<SuspectsViewModel>();
			SimpleIoc.Default.Register<HeatmapViewModel>();
			SimpleIoc.Default.Register<KillsViewModel>();
			SimpleIoc.Default.Register<OverviewViewModel>();
			SimpleIoc.Default.Register<DemoDamagesViewModel>();
			SimpleIoc.Default.Register<AccountStatsOverallViewModel>();
			SimpleIoc.Default.Register<AccountStatsRankViewModel>();
			SimpleIoc.Default.Register<AccountStatsMapViewModel>();
			SimpleIoc.Default.Register<AccountStatsWeaponViewModel>();
			SimpleIoc.Default.Register<AccountStatsProgressViewModel>();
			SimpleIoc.Default.Register<WhitelistViewModel>();
			SimpleIoc.Default.Register<DemoFlashbangsViewModel>();
		}

		public MainViewModel Main
		{
			get
			{
				return ServiceLocator.Current.GetInstance<MainViewModel>();
			}
		}

		public SettingsViewModel Settings
		{
			get
			{
				return ServiceLocator.Current.GetInstance<SettingsViewModel>();
			}
		}

		public DetailsViewModel Details
		{
			get
			{
				return ServiceLocator.Current.GetInstance<DetailsViewModel>();
			}
		}

		public HomeViewModel Home
		{
			get
			{
				return ServiceLocator.Current.GetInstance<HomeViewModel>();
			}
		}

		public SuspectsViewModel Suspects
		{
			get
			{
				return ServiceLocator.Current.GetInstance<SuspectsViewModel>();
			}
		}

		public HeatmapViewModel Heatmap
		{
			get
			{
				return ServiceLocator.Current.GetInstance<HeatmapViewModel>();
			}
		}

		public KillsViewModel Kills
		{
			get
			{
				return ServiceLocator.Current.GetInstance<KillsViewModel>();
			}
		}

		public OverviewViewModel Overview
		{
			get
			{
				return ServiceLocator.Current.GetInstance<OverviewViewModel>();
			}
		}

		public DemoDamagesViewModel DemoDamages
		{
			get
			{
				return ServiceLocator.Current.GetInstance<DemoDamagesViewModel>();
			}
		}

		public AccountStatsOverallViewModel AccountStatsGeneral
		{
			get
			{
				return ServiceLocator.Current.GetInstance<AccountStatsOverallViewModel>();
			}
		}

		public AccountStatsRankViewModel AccountStatsRank
		{
			get
			{
				return ServiceLocator.Current.GetInstance<AccountStatsRankViewModel>();
			}
		}

		public AccountStatsMapViewModel AccountStatsMap
		{
			get
			{
				return ServiceLocator.Current.GetInstance<AccountStatsMapViewModel>();
			}
		}

		public AccountStatsWeaponViewModel AccountStatsWeapon
		{
			get
			{
				return ServiceLocator.Current.GetInstance<AccountStatsWeaponViewModel>();
			}
		}

		public AccountStatsProgressViewModel AccountStatsProgress
		{
			get
			{
				return ServiceLocator.Current.GetInstance<AccountStatsProgressViewModel>();
			}
		}

		public WhitelistViewModel Whitelist
		{
			get
			{
				return ServiceLocator.Current.GetInstance<WhitelistViewModel>();
			}
		}

		public DemoFlashbangsViewModel DemoFlashbangs
		{
			get
			{
				return ServiceLocator.Current.GetInstance<DemoFlashbangsViewModel>();
			}
		}

		public static void Cleanup()
		{
			// TODO Clear the ViewModels
		}
	}
}