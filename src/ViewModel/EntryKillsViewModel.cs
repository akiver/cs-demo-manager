using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Views;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;

namespace CSGO_Demos_Manager.ViewModel
{
	public class EntryKillsViewModel : ViewModelBase
	{
		#region Properties

		private Demo _currentDemo;

		private RelayCommand<Demo> _backToDemoDetailsCommand;

		#endregion

		public Demo CurrentDemo
		{
			get { return _currentDemo; }
			set { Set(() => CurrentDemo, ref _currentDemo, value); }
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
						},
						demo => CurrentDemo != null));
			}
		}
	}
}