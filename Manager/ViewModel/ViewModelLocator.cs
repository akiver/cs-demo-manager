using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.Ioc;
using Manager.Services;
using Manager.ViewModel.Accounts;
using Manager.ViewModel.Demos;
using Manager.ViewModel.Players;
using Manager.ViewModel.Rounds;
using Manager.ViewModel.Shared;
using Manager.ViewModel.Suspects;
using Microsoft.Practices.ServiceLocation;
using Services.Concrete;
using Services.Concrete.Excel;
using Services.Concrete.Maps;
using Services.Design;
using Services.Interfaces;

namespace Manager.ViewModel
{
	public class ViewModelLocator
	{
		public ViewModelLocator()
		{
			ServiceLocator.SetLocatorProvider(() => SimpleIoc.Default);

			if (ViewModelBase.IsInDesignModeStatic)
			{
				// Create design time view services and models
				SimpleIoc.Default.Register<IDemosService, DemosDesignService>();
				SimpleIoc.Default.Register<ISteamService, SteamDesignService>();
				SimpleIoc.Default.Register<ICacheService, CacheDesignService>();
				SimpleIoc.Default.Register<ExcelService, ExcelService>();
				SimpleIoc.Default.Register<IFlashbangService, FlashbangDesignService>();
				SimpleIoc.Default.Register<IKillService, KillDesignService>();
				SimpleIoc.Default.Register<IRoundService, RoundDesignService>();
				SimpleIoc.Default.Register<IPlayerService, PlayerDesignService>();
				SimpleIoc.Default.Register<IDamageService, DamageDesignService>();
				SimpleIoc.Default.Register<IStuffService, StuffDesignService>();
				SimpleIoc.Default.Register<IAccountStatsService, AccountStatsDesignService>();
				SimpleIoc.Default.Register<IMapService, MapDesignService>();
				SimpleIoc.Default.Register<IDialogService, DialogService>();
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
				SimpleIoc.Default.Register<IRoundService, RoundService>();
				SimpleIoc.Default.Register<IPlayerService, PlayerService>();
				SimpleIoc.Default.Register<IDamageService, DamageService>();
				SimpleIoc.Default.Register<IStuffService, StuffService>();
				SimpleIoc.Default.Register<IAccountStatsService, AccountStatsService>();
				SimpleIoc.Default.Register<IMapService, MapService>();
				SimpleIoc.Default.Register<IDialogService, DialogService>();
			}

			SimpleIoc.Default.Register<MainViewModel>();
			SimpleIoc.Default.Register<DemoListViewModel>();
			SimpleIoc.Default.Register<SettingsViewModel>();
			SimpleIoc.Default.Register<DemoDetailsViewModel>();
			SimpleIoc.Default.Register<SuspectListViewModel>();
			SimpleIoc.Default.Register<DemoHeatmapViewModel>();
			SimpleIoc.Default.Register<DemoKillsViewModel>();
			SimpleIoc.Default.Register<DemoOverviewViewModel>();
			SimpleIoc.Default.Register<DemoDamagesViewModel>();
			SimpleIoc.Default.Register<AccountOverallViewModel>();
			SimpleIoc.Default.Register<AccountRankViewModel>();
			SimpleIoc.Default.Register<AccountMapsViewModel>();
			SimpleIoc.Default.Register<AccountWeaponsViewModel>();
			SimpleIoc.Default.Register<AccountProgressViewModel>();
			SimpleIoc.Default.Register<WhitelistViewModel>();
			SimpleIoc.Default.Register<DemoFlashbangsViewModel>();
			SimpleIoc.Default.Register<RoundDetailsViewModel>();
			SimpleIoc.Default.Register<DemoStuffsViewModel>();
			SimpleIoc.Default.Register<DemoMovieViewModel>();
			SimpleIoc.Default.Register<PlayerDetailsViewModel>();
			SimpleIoc.Default.Register<DialogThirdPartiesViewModel>();
		}

		public MainViewModel Main => ServiceLocator.Current.GetInstance<MainViewModel>();

		public SettingsViewModel Settings => ServiceLocator.Current.GetInstance<SettingsViewModel>();

		public DemoDetailsViewModel DemoDetails => ServiceLocator.Current.GetInstance<DemoDetailsViewModel>();

		public DemoListViewModel DemoList => ServiceLocator.Current.GetInstance<DemoListViewModel>();

		public SuspectListViewModel SuspectList => ServiceLocator.Current.GetInstance<SuspectListViewModel>();

		public DemoHeatmapViewModel DemoHeatmap => ServiceLocator.Current.GetInstance<DemoHeatmapViewModel>();

		public DemoKillsViewModel DemoKills => ServiceLocator.Current.GetInstance<DemoKillsViewModel>();

		public DemoOverviewViewModel DemoOverview => ServiceLocator.Current.GetInstance<DemoOverviewViewModel>();

		public DemoDamagesViewModel DemoDamages => ServiceLocator.Current.GetInstance<DemoDamagesViewModel>();

		public AccountOverallViewModel AccountOverall => ServiceLocator.Current.GetInstance<AccountOverallViewModel>();

		public AccountRankViewModel AccountRank => ServiceLocator.Current.GetInstance<AccountRankViewModel>();

		public AccountMapsViewModel AccountMaps => ServiceLocator.Current.GetInstance<AccountMapsViewModel>();

		public AccountWeaponsViewModel AccountWeapons => ServiceLocator.Current.GetInstance<AccountWeaponsViewModel>();

		public AccountProgressViewModel AccountProgress => ServiceLocator.Current.GetInstance<AccountProgressViewModel>();

		public WhitelistViewModel Whitelist => ServiceLocator.Current.GetInstance<WhitelistViewModel>();

		public DemoFlashbangsViewModel DemoFlashbangs => ServiceLocator.Current.GetInstance<DemoFlashbangsViewModel>();

		public RoundDetailsViewModel RoundDetails => ServiceLocator.Current.GetInstance<RoundDetailsViewModel>();

		public DemoStuffsViewModel DemoStuffs => ServiceLocator.Current.GetInstance<DemoStuffsViewModel>();

		public DemoMovieViewModel DemoMovie => ServiceLocator.Current.GetInstance<DemoMovieViewModel>();

		public PlayerDetailsViewModel PlayerDetails => ServiceLocator.Current.GetInstance<PlayerDetailsViewModel>();

		public DialogThirdPartiesViewModel ThirdParties => ServiceLocator.Current.GetInstance<DialogThirdPartiesViewModel>();

		public static void Cleanup()
		{
		}
	}
}