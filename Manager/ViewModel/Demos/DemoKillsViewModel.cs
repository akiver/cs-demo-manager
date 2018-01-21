using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using Core.Models;
using GalaSoft.MvvmLight.CommandWpf;
using Manager.ViewModel.Shared;
using Manager.Views.Demos;
using Services.Interfaces;
using Services.Models.Stats;
using Demo = Core.Models.Demo;

namespace Manager.ViewModel.Demos
{
	public class DemoKillsViewModel : SingleDemoViewModel
	{
		#region Properties

		private RelayCommand<Demo> _backToDemoDetailsCommand;

		private RelayCommand _windowLoadedCommand;

		private List<KillDataPoint> _killsData;

		private int _maxPlayerKillCount;

		private readonly IKillService _killService;

		#endregion

		#region Accessors

		public int MaxPlayerKillCount
		{
			get { return _maxPlayerKillCount; }
			set { Set(() => MaxPlayerKillCount, ref _maxPlayerKillCount, value); }
		}

		public List<Team> Teams
		{
			get
			{
				List<Team> teams = new List<Team>
				{
					Demo.TeamCT,
					Demo.TeamT
				};
				return teams;
			}
		}

		public List<KillDataPoint> KillsData
		{
			get { return _killsData; }
			set { Set(() => KillsData, ref _killsData, value); }
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
							var detailsViewModel = new ViewModelLocator().DemoDetails;
							detailsViewModel.Demo = demo;
							var mainViewModel = new ViewModelLocator().Main;
							DemoDetailsView detailsView = new DemoDetailsView();
							mainViewModel.CurrentPage.ShowPage(detailsView);
						},
						demo => Demo != null));
			}
		}

		#endregion

		private async Task LoadDatas()
		{
			_killService.Demo = Demo;
			KillsData = await _killService.GetPlayersKillsMatrix();
			if (KillsData.Any()) MaxPlayerKillCount = KillsData.Max(p => p.Count);
		}

		public DemoKillsViewModel(IKillService killService)
		{
			_killService = killService;

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
			KillsData.Clear();
			MaxPlayerKillCount = 0;
		}
	}
}