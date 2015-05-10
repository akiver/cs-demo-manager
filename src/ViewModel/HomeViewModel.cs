using System;
using CSGO_Demos_Manager.Messages;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Services;
using CSGO_Demos_Manager.Views;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using GalaSoft.MvvmLight.Messaging;
using GalaSoft.MvvmLight.Threading;
using MahApps.Metro.Controls.Dialogs;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Data;
using CSGO_Demos_Manager.Models.Source;

namespace CSGO_Demos_Manager.ViewModel
{
	public class HomeViewModel : ViewModelBase
	{

		#region Properties

		private readonly IDemosService _demosService;

		private readonly DialogService _dialogService;

		private readonly ICacheService _cacheService;

		private readonly ISteamService _steamService;

		private bool _isBusy;

		private bool _hasNotification;

		private bool _isShowAllFolders;

		private bool _isShowPovDemos = Properties.Settings.Default.ShowPovDemos;

		private bool _isShowEbotDemos = Properties.Settings.Default.ShowEbotDemos;

		private bool _isShowEseaDemos = Properties.Settings.Default.ShowEseaDemos;

		private bool _isShowValveDemos = Properties.Settings.Default.ShowValveDemos;

		private string _notificationMessage;

		ObservableCollection<Demo> _demos;

		ObservableCollection<Demo> _selectedDemos;

		private ICollectionView _dataGridDemosCollection;

		private string _filterDemoText;

		private Demo _selectedDemo;

		private RelayCommand<Demo> _showDemoDetailsCommand;

		private RelayCommand<ObservableCollection<Demo>> _analyzeDemosCommand;

		private RelayCommand<Demo> _watchDemoCommand;

		private RelayCommand<Demo> _watchHighlightCommand;

		private RelayCommand<Demo> _watchLowlightCommand;

		private RelayCommand<Demo> _browseToDemoCommand;

		private RelayCommand<Demo> _goToTickCommand;

		private RelayCommand<bool> _showAllFoldersCommand;

		private RelayCommand<bool> _showPovDemosCommand;

		private RelayCommand<bool> _showEbotDemosCommand;

		private RelayCommand<bool> _showEseaDemosCommand;

		private RelayCommand<bool> _showValveDemosCommand;

		private RelayCommand _backToHomeCommand;

		private RelayCommand _showSuspectsCommand;

		private RelayCommand _refreshListCommand;

		private RelayCommand<string> _saveStatusDemoCommand;

		private RelayCommand<string> _setDemoSourceCommand;

		private int _newBannedPlayerCount;

		private ObservableCollection<string> _folders;

		private string _selectedFolder;

		#endregion

		#region Accessors

		public bool IsBusy
		{
			get { return _isBusy; }
			set { Set(() => IsBusy, ref _isBusy, value); }
		}

		public bool IsShowAllFolders
		{
			get { return _isShowAllFolders; }
			set { Set(() => IsShowAllFolders, ref _isShowAllFolders, value); }
		}

		public bool IsShowPovDemos
		{
			get { return _isShowPovDemos; }
			set
			{
				Set(() => IsShowPovDemos, ref _isShowPovDemos, value);
				FilterCollection();
			}
		}

		public bool IsShowEbotDemos
		{
			get { return _isShowEbotDemos; }
			set
			{
				Set(() => IsShowEbotDemos, ref _isShowEbotDemos, value);
				FilterCollection();
			}
		}

		public bool IsShowEseaDemos
		{
			get { return _isShowEseaDemos; }
			set
			{
				Set(() => IsShowEseaDemos, ref _isShowEseaDemos, value);
				FilterCollection();
			}
		}

		public bool IsShowValveDemos
		{
			get { return _isShowValveDemos; }
			set
			{
				Set(() => IsShowValveDemos, ref _isShowValveDemos, value);
				FilterCollection();
			}
		}

		public int NewBannedPlayerCount
		{
			get { return _newBannedPlayerCount; }
			set
			{
				Set(() => NewBannedPlayerCount, ref _newBannedPlayerCount, value);
				RaisePropertyChanged("NewBannedPlayerCountAsString");
			}
		}

		public string NewBannedPlayerCountAsString => string.Format("({0})", _newBannedPlayerCount);

		public bool HasNotification
		{
			get { return _hasNotification; }
			set { Set(() => HasNotification, ref _hasNotification, value); }
		}

		public string NotificationMessage
		{
			get { return _notificationMessage; }
			set { Set(() => NotificationMessage, ref _notificationMessage, value); }
		}

		public Demo SelectedDemo
		{
			get { return _selectedDemo; }
			set { Set(() => SelectedDemo, ref _selectedDemo, value); }
		}

		public ObservableCollection<Demo> Demos
		{
			get { return _demos; }
			set { Set(() => Demos, ref _demos, value); }
		}

		public ObservableCollection<Demo> SelectedDemos
		{
			get { return _selectedDemos; }
			set { Set(() => SelectedDemos, ref _selectedDemos, value); }
		}

		public ICollectionView DataGridDemosCollection
		{
			get { return _dataGridDemosCollection; }
			set { Set(() => DataGridDemosCollection, ref _dataGridDemosCollection, value); }
		}

		public string FilterDemoText
		{
			get { return _filterDemoText; }
			set {
				Set(() => FilterDemoText, ref _filterDemoText, value);
				FilterCollection();
			}
		}

		public ObservableCollection<string> Folders
		{
			get { return _folders; }
			set { Set(() => Folders, ref _folders, value); }
		}

		public string SelectedFolder
		{
			get { return _selectedFolder; }
			set
			{
				Set(() => SelectedFolder, ref _selectedFolder, value);
				DispatcherHelper.CheckBeginInvokeOnUI(
				async () =>
				{
					if (!string.IsNullOrWhiteSpace(value))
					{
						Properties.Settings.Default.LastFolder = value;
						Properties.Settings.Default.Save();
					}
					await LoadDemosHeader();
				});
			}
		}

		#endregion

		#region Filters

		public bool Filter(object obj)
		{
			var data = obj as Demo;
			if (data != null)
			{
				// Text filter
				if (!string.IsNullOrEmpty(_filterDemoText))
				{
					return data.Name.Contains(_filterDemoText) || data.MapName.Contains(_filterDemoText)
						|| data.Comment.Contains(_filterDemoText) || data.Hostname.Contains(_filterDemoText)
						|| data.ClientName.Contains(_filterDemoText) || data.ClanTagNameTeam1.Contains(_filterDemoText)
						|| data.ClanTagNameTeam2.Contains(_filterDemoText) || data.SourceName.Contains(_filterDemoText)
						|| (data.Date != null && data.Date.Contains(_filterDemoText));
				}

				// POV filter
				if (!IsShowPovDemos && data.SourceName == "pov") return false;

				// eBot filter
				if (!IsShowEbotDemos && data.SourceName == "ebot") return false;

				// ESEA filter
				if (!IsShowEseaDemos && data.SourceName == "esea") return false;

				// Valve filter
				if (!IsShowValveDemos && data.SourceName == "valve") return false;

				return true;
			}
			return false;
		}

		private void FilterCollection()
		{
			_dataGridDemosCollection?.Refresh();
		}

		#endregion

		#region Commands

		public RelayCommand<IList> DemosSelectionChangedCommand { get; private set; }

		/// <summary>
		/// Command to start demo(s) analysis
		/// </summary>
		public RelayCommand<ObservableCollection<Demo>> AnalyzeDemosCommand
		{
			get
			{
				return _analyzeDemosCommand
					?? (_analyzeDemosCommand = new RelayCommand<ObservableCollection<Demo>>(
					demos =>
					{
						RefreshSelectedDemos();
					},
					demos => SelectedDemos != null && SelectedDemos.Count > 0 && SelectedDemos.Count(d => d.Source.GetType() == typeof(Pov)) == 0 && !IsBusy));
			}
		}

		/// <summary>
		/// Command to show details view
		/// </summary>
		public RelayCommand<Demo> ShowDemoDetailsCommand
		{
			get
			{
				return _showDemoDetailsCommand
					?? (_showDemoDetailsCommand = new RelayCommand<Demo>(
						demo =>
						{
							// Set the demo
							var detailsViewModel = (new ViewModelLocator()).Details;
							detailsViewModel.CurrentDemo = demo;

							// Display the UserControl
							var mainViewModel = (new ViewModelLocator()).Main;
							DetailsView detailsView = new DetailsView();
							mainViewModel.CurrentPage.ShowPage(detailsView);
						},
						demo => SelectedDemo != null));
			}
		}

		/// <summary>
		/// Command to go to a specific tick
		/// </summary>
		public RelayCommand<Demo> GoToTickCommand
		{
			get
			{
				return _goToTickCommand
					?? (_goToTickCommand = new RelayCommand<Demo>(
						async demo =>
						{
							var result = await _dialogService.ShowInputAsync("Goto Tick", "Enter the tick.");
							if (string.IsNullOrEmpty(result)) return;
							int tick;
							bool isInt = int.TryParse(result, out tick);
								
							if (isInt)
							{
								GameLauncher launcher = new GameLauncher();
								launcher.WatchDemoAt(SelectedDemo, tick);
							} else
							{
								await _dialogService.ShowErrorAsync("Invalid tick.", MessageDialogStyle.Affirmative);
							}
						},
						demo => SelectedDemo != null && AppSettings.IsCsgoInstalled()));
			}
		}

		/// <summary>
		/// Command when the checkbox to display demos from all folders is clicked
		/// </summary>
		public RelayCommand<bool> ShowAllFoldersCommand
		{
			get
			{
				return _showAllFoldersCommand
					?? (_showAllFoldersCommand = new RelayCommand<bool>(
						isChecked =>
						{
							if (isChecked)
							{
								SelectedFolder = null;
							}
							else
							{
								if (Folders.Count > 0)
								{
									if (!string.IsNullOrWhiteSpace(Properties.Settings.Default.LastFolder))
									{
										SelectedFolder = Properties.Settings.Default.LastFolder;
									}
									else
									{
										SelectedFolder = Folders.ElementAt(0);
									}
								}
								
							}
							Properties.Settings.Default.ShowAllFolders = isChecked;
							Properties.Settings.Default.Save();
						},
						isChecked => !IsBusy));
			}
		}

		/// <summary>
		/// Command when the checkbox to toggle POV demos is clicked
		/// </summary>
		public RelayCommand<bool> ShowPovDemosCommand
		{
			get
			{
				return _showPovDemosCommand
					?? (_showPovDemosCommand = new RelayCommand<bool>(
						isChecked =>
						{
							IsShowPovDemos = isChecked;
							DataGridDemosCollection.Refresh();
							Properties.Settings.Default.ShowPovDemos = isChecked;
							Properties.Settings.Default.Save();
						},
						isChecked => !IsBusy));
			}
		}

		/// <summary>
		/// Command when the checkbox to toggle eBot demos is clicked
		/// </summary>
		public RelayCommand<bool> ShowEbotDemosCommand
		{
			get
			{
				return _showEbotDemosCommand
					?? (_showEbotDemosCommand = new RelayCommand<bool>(
						isChecked =>
						{
							IsShowEbotDemos = isChecked;
							DataGridDemosCollection.Refresh();
							Properties.Settings.Default.ShowEbotDemos = isChecked;
							Properties.Settings.Default.Save();
						},
						isChecked => !IsBusy));
			}
		}

		/// <summary>
		/// Command when the checkbox to toggle ESEA demos is clicked
		/// </summary>
		public RelayCommand<bool> ShowEseaDemosCommand
		{
			get
			{
				return _showEseaDemosCommand
					?? (_showEseaDemosCommand = new RelayCommand<bool>(
						isChecked =>
						{
							IsShowEseaDemos = isChecked;
							DataGridDemosCollection.Refresh();
							Properties.Settings.Default.ShowEseaDemos = isChecked;
							Properties.Settings.Default.Save();
						},
						isChecked => !IsBusy));
			}
		}

		/// <summary>
		/// Command when the checkbox to toggle Valve demos is clicked
		/// </summary>
		public RelayCommand<bool> ShowValveDemosCommand
		{
			get
			{
				return _showValveDemosCommand
					?? (_showValveDemosCommand = new RelayCommand<bool>(
						isChecked =>
						{
							IsShowValveDemos = isChecked;
							DataGridDemosCollection.Refresh();
							Properties.Settings.Default.ShowValveDemos = isChecked;
							Properties.Settings.Default.Save();
						},
						isChecked => !IsBusy));
			}
		}

		/// <summary>
		/// Browse to demo command
		/// </summary>
		public RelayCommand<Demo> BrowseToDemoCommand
		{
			get
			{
				return _browseToDemoCommand
					?? (_browseToDemoCommand = new RelayCommand<Demo>(
						async demo =>
						{
							if (!File.Exists(demo.Path))
							{
								await _dialogService.ShowErrorAsync("Demo not found.", MessageDialogStyle.Affirmative);
								return;
							}

							string argument = "/select, \"" + demo.Path + "\"";
							Process.Start("explorer.exe", argument);
						},
						demo => SelectedDemo != null));
			}
		}

		/// <summary>
		/// Command to refresh demos list
		/// </summary>
		public RelayCommand RefreshListCommand
		{
			get
			{
				return _refreshListCommand
					?? (_refreshListCommand = new RelayCommand(
						async () =>
						{
							await LoadDemosHeader();
						}, () => !IsBusy));
			}
		}

		/// <summary>
		/// Command to show suspects view
		/// </summary>
		public RelayCommand ShowSuspectsCommand
		{
			get
			{
				return _showSuspectsCommand
					?? (_showSuspectsCommand = new RelayCommand(
						() =>
						{
							var mainViewModel = (new ViewModelLocator()).Main;
							SuspectsView myDemosView = new SuspectsView();
							mainViewModel.CurrentPage.ShowPage(myDemosView);
						}));
			}
		}

		/// <summary>
		/// Command to watch a demo
		/// </summary>
		public RelayCommand<Demo> WatchDemoCommand
		{
			get
			{
				return _watchDemoCommand
					?? (_watchDemoCommand = new RelayCommand<Demo>(
					demo =>
					{
						if (!WatchDemoCommand.CanExecute(null))
						{
							return;
						}
						// Play the demo
						GameLauncher launcher = new GameLauncher();
						launcher.WatchDemo(demo);
					},
					demo => SelectedDemo != null && AppSettings.IsCsgoInstalled()));
			}
		}

		/// <summary>
		/// Command to watch player's highlights
		/// </summary>
		public RelayCommand<Demo> WatchHighlightCommand
		{
			get
			{
				return _watchHighlightCommand
					?? (_watchHighlightCommand = new RelayCommand<Demo>(
					demo =>
					{
						GameLauncher launcher = new GameLauncher();
						launcher.WatchHighlightDemo(demo);
					},
					demo => SelectedDemo != null && Properties.Settings.Default.SteamID != 0));
			}
		}

		/// <summary>
		/// Command to watch player's lowlights
		/// </summary>
		public RelayCommand<Demo> WatchLowlightCommand
		{
			get
			{
				return _watchLowlightCommand
					?? (_watchLowlightCommand = new RelayCommand<Demo>(
					demo =>
					{
						GameLauncher launcher = new GameLauncher();
						launcher.WatchLowlightDemo(demo);
					},
					demo => SelectedDemo != null && Properties.Settings.Default.SteamID != 0));
			}
		}

		/// <summary>
		/// Command to set the demo's status
		/// </summary>
		public RelayCommand<string> SaveStatusDemoCommand
		{
			get
			{
				return _saveStatusDemoCommand
					?? (_saveStatusDemoCommand = new RelayCommand<string>(
					async status =>
					{
						foreach (Demo demo in SelectedDemos)
						{
							await _demosService.SaveStatus(demo, status);
						}
						DataGridDemosCollection.Refresh();
					},
					status => SelectedDemos != null && SelectedDemos.Count > 0));
			}
		}

		/// <summary>
		/// Command to set the demo's source
		/// </summary>
		public RelayCommand<string> SetDemoSourceCommand
		{
			get
			{
				return _setDemoSourceCommand
					?? (_setDemoSourceCommand = new RelayCommand<string>(
					async source =>
					{
						await _demosService.SetSource(SelectedDemos, source);
					},
					source => SelectedDemos != null && SelectedDemos.Count > 0));
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
						HomeView homeView = new HomeView();
						mainViewModel.CurrentPage.ShowPage(homeView);
					}));
			}
		}

		#endregion

		public HomeViewModel(IDemosService demosService, DialogService dialogService, ISteamService steamService, ICacheService cacheService)
		{
			_demosService = demosService;
			_dialogService = dialogService;
			_steamService = steamService;
			_cacheService = cacheService;

			if (IsInDesignModeStatic)
			{
				DispatcherHelper.Initialize();
			}

			Demos = new ObservableCollection<Demo>();
			SelectedDemos = new ObservableCollection<Demo>();
			DataGridDemosCollection = CollectionViewSource.GetDefaultView(Demos);
			DataGridDemosCollection.Filter = Filter;
			Folders = AppSettings.GetFolders();
			IsShowAllFolders = Properties.Settings.Default.ShowAllFolders;

			if (IsShowAllFolders)
			{
				SelectedFolder = null;
			} else if (!string.IsNullOrWhiteSpace(Properties.Settings.Default.LastFolder))
			{
				SelectedFolder = Properties.Settings.Default.LastFolder;
			} else if (Folders.Count > 0)
			{
				SelectedFolder = Folders.ElementAt(0);
			}
			

			DispatcherHelper.CheckBeginInvokeOnUI(
			async () =>
			{
				await LoadDemosHeader();
				await RefreshBannedPlayerCount();
			});

			DemosSelectionChangedCommand = new RelayCommand<IList>(
			demos =>
			{
				if (IsBusy) return;
				if (demos == null) return;
				
				SelectedDemos.Clear();
				foreach(Demo demo in demos)
				{
					SelectedDemos.Add(demo);
				}
			});

			Messenger.Default.Register<RefreshDemosMessage>(this, HandleRefreshDemosMessage);
		}

		private void HandleRefreshDemosMessage(RefreshDemosMessage msg)
		{
			DispatcherHelper.CheckBeginInvokeOnUI(
			async () =>
			{
				Folders = AppSettings.GetFolders();
				await LoadDemosHeader();
			});
		}

		private async void RefreshSelectedDemos()
		{
			IsBusy = true;
			HasNotification = true;
			NotificationMessage = "Analyzing...";
			foreach (Demo demo in SelectedDemos)
			{
				try
				{
					await _demosService.AnalyzeDemo(demo);
				}
				catch (Exception e)
				{
					await _dialogService.ShowErrorAsync("An error occured while analyzing the demo " + demo.Name + "." +
														"The demo may be too old, if not please send an email with the attached demo." +
														"You can find more information on http://csgo-demos-manager.com.", MessageDialogStyle.Affirmative);
				}
			}
			IsBusy = false;
			HasNotification = false;
		}

		private async Task RefreshBannedPlayerCount()
		{
			List<string> suspectIdList = await _cacheService.GetSuspectsListFromCache();
			try
			{
				NewBannedPlayerCount = await _steamService.GetBannedPlayerCount(suspectIdList);
			}
			catch (Exception e)
			{
				await _dialogService.ShowErrorAsync("Error while trying to get suspects information.", MessageDialogStyle.Affirmative);
			}
		}

		public async Task LoadDemosHeader()
		{
			NotificationMessage = "Loading...";
			IsBusy = true;
			HasNotification = true;

			List<string> folders = new List<string>();

			if (SelectedFolder != null)
			{
				folders.Add(SelectedFolder);
			}
			else
			{
				folders = Folders.ToList();
			}

			var demos = await _demosService.GetDemosHeader(folders);

			Demos.Clear();
			foreach (var demo in demos)
			{
				Demos.Add(demo);
			}

			IsBusy = false;
			HasNotification = false;
		}
	}
}
