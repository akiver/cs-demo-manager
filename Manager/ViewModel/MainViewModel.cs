using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using System.Windows.Forms;
using Core;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using GalaSoft.MvvmLight.Messaging;
using MahApps.Metro.Controls.Dialogs;
using Manager.Messages;
using Manager.Services;
using Manager.Views.Demos;
using Manager.Views.Suspects;
using Services.Interfaces;
using WpfPageTransitions;

namespace Manager.ViewModel
{
	public class MainViewModel : ViewModelBase
	{

		#region Properties

		private PageTransition _currentPage;

		private bool _isSettingsOpen;

		private RelayCommand _settingsFlyoutOpendedCommand;

		private RelayCommand _settingsFlyoutClosedCommand;

		private ObservableCollection<string> _folders = new ObservableCollection<string>();

		private string _selectedFolder;

		private RelayCommand _addFolderCommand;

		private RelayCommand<string> _removeFolderCommand;

		public string CreditsText => AppSettings.APP_NAME + " " + AppSettings.APP_VERSION + " by " + AppSettings.AUTHOR;

		private readonly DialogService _dialogService;

		private RelayCommand _windowLoadedCommand;

		private RelayCommand _windowClosedCommand;

		private readonly ICacheService _cacheService;

		private long _cacheSize;

		#endregion

		#region Accessors

		public PageTransition CurrentPage
		{
			get { return _currentPage; }
			set { Set(() => CurrentPage, ref _currentPage, value); }
		}

		public bool IsSettingsOpen
		{
			get { return _isSettingsOpen; }
			set { Set(() => IsSettingsOpen, ref _isSettingsOpen, value); }
		}

		public string SelectedFolder
		{
			get { return _selectedFolder; }
			set { Set(() => SelectedFolder, ref _selectedFolder, value); }
		}

		public ObservableCollection<string> Folders
		{
			get { return _folders; }
			set { Set(() => Folders, ref _folders, value); }
		}

		public long CacheSize
		{
			get { return _cacheSize; }
			set
			{
				Set(() => CacheSize, ref _cacheSize, value);
				RaisePropertyChanged(() => CacheSizeAsString);
			}
		}

		public string CacheSizeAsString => "Size : ~ " + Math.Round(_cacheSize / 1024f / 1024f) + "MB";

		#endregion

		#region Commands

		/// <summary>
		/// Command fired when MainWindow is loaded
		/// </summary>
		public RelayCommand WindowLoaded
		{
			get
			{
				return _windowLoadedCommand
					?? (_windowLoadedCommand = new RelayCommand(
					async () =>
					{
						if (Folders.Count == 0)
						{
							await _dialogService.ShowMessageAsync("It seems that CSGO is not installed on your main hard drive. The defaults \"csgo\" and \"replays\" can not be found. Please add folders from the settings.", MessageDialogStyle.Affirmative);
						}

						// Check for 1st launch or upgrade that required cache clear (when app major / minor version > major / minor config version)
						if (_cacheService.ContainsDemos())
						{
							if (string.IsNullOrEmpty(Properties.Settings.Default.ApplicationVersion)
								|| !string.IsNullOrEmpty(Properties.Settings.Default.ApplicationVersion)
								&& new Version(Properties.Settings.Default.ApplicationVersion).Major.CompareTo(AppSettings.APP_VERSION.Major) < 0
								|| (!string.IsNullOrEmpty(Properties.Settings.Default.ApplicationVersion)
								&& new Version(Properties.Settings.Default.ApplicationVersion).Major.CompareTo(AppSettings.APP_VERSION.Major) == 0
								&& new Version(Properties.Settings.Default.ApplicationVersion).Minor.CompareTo(AppSettings.APP_VERSION.Minor) < 0))
							{
								var saveCustomData = await _dialogService.ShowMessageAsync("This update required to clear custom data from cache (your suspects list will not be removed). Do you want to save your custom data? ", MessageDialogStyle.AffirmativeAndNegative);
								if (saveCustomData == MessageDialogResult.Affirmative)
								{
									SaveFileDialog saveCustomDataDialog = new SaveFileDialog
									{
										FileName = "backup.json",
										Filter = "JSON file (*.json)|*.json"
									};

									if (saveCustomDataDialog.ShowDialog() == DialogResult.OK)
									{
										try
										{
											await _cacheService.CreateBackupCustomDataFile(saveCustomDataDialog.FileName);
											await _dialogService.ShowMessageAsync("The backup file has been created, you have to re-import your custom data from settings.", MessageDialogStyle.Affirmative);
										}
										catch (Exception e)
										{
											Logger.Instance.Log(e);
											await _dialogService.ShowErrorAsync("An error occured while exporting custom data.", MessageDialogStyle.Affirmative);
										}
									}
								}
								// Clear cache even if user didn't want to backup his custom data
								await _cacheService.ClearDemosFile();
							}
						}

						// Update the user version
						Properties.Settings.Default.ApplicationVersion = AppSettings.APP_VERSION.ToString();
						Properties.Settings.Default.Save();

						// Check for update
						if (AppSettings.IsInternetConnectionAvailable() && Properties.Settings.Default.EnableCheckUpdate)
						{
							bool isUpdateAvailable = await CheckUpdate();
							if (isUpdateAvailable)
							{
								var download = await _dialogService.ShowMessageAsync("A new version is available. Do you want to download it?", MessageDialogStyle.AffirmativeAndNegative);
								if (download == MessageDialogResult.Affirmative)
								{
									System.Diagnostics.Process.Start(AppSettings.APP_WEBSITE);
								}
							}
						}

						switch (App.StartUpWindow)
						{
							case "suspects":
								SuspectListView suspectsView = new SuspectListView();
								CurrentPage.ShowPage(suspectsView);
								break;
							case "demo":
								DemoDetailsView demoDetails = new DemoDetailsView();
								CurrentPage.ShowPage(demoDetails);
								break;
							default:
								DemoListView demoListView = new DemoListView();
								CurrentPage.ShowPage(demoListView);
								break;
						}

						// Notify the DemoListViewModel that it can now load demos data
						MainWindowLoadedMessage msg = new MainWindowLoadedMessage();
						Messenger.Default.Send(msg);
					}));
			}
		}

		/// <summary>
		/// Command fired when Main Window is closed
		/// </summary>
		public RelayCommand WindowClosed
		{
			get
			{
				return _windowClosedCommand
					?? (_windowClosedCommand = new RelayCommand(
					() =>
					{
						if (Folders.Count == 0)
						{
							Properties.Settings.Default.LastFolder = string.Empty;
							Properties.Settings.Default.Save();
						}
					}));
			}
		}

		/// <summary>
		/// Command to add a new folder
		/// </summary>
		public RelayCommand AddFolderCommand
		{
			get
			{
				return _addFolderCommand
					?? (_addFolderCommand = new RelayCommand(
					async () =>
					{
						FolderBrowserDialog folderDialog = new FolderBrowserDialog
						{
							SelectedPath = Path.GetPathRoot(Environment.GetFolderPath(Environment.SpecialFolder.System))
						};

						DialogResult result = folderDialog.ShowDialog();
						if (result != DialogResult.OK) return;
						string path = Path.GetFullPath(folderDialog.SelectedPath).ToLower();
						if (Folders.Contains(path)) return;
						bool isAdded = await _cacheService.AddFolderAsync(path);
						if (isAdded) Folders.Add(path);
					}));
			}
		}

		/// <summary>
		/// Command to remove a specific folder
		/// </summary>
		public RelayCommand<string> RemoveFolderCommand
		{
			get
			{
				return _removeFolderCommand
					?? (_removeFolderCommand = new RelayCommand<string>(
					async folder =>
					{
						bool isRemoved = await _cacheService.RemoveFolderAsync(folder);
						if (isRemoved) Folders.Remove(folder);
					},
					f => SelectedFolder != null));
			}
		}

		/// <summary>
		/// Command fired when the settings flyout is opened
		/// </summary>
		public RelayCommand SettingsFlyoutOpenedCommand
		{
			get
			{
				return _settingsFlyoutOpendedCommand
					?? (_settingsFlyoutOpendedCommand = new RelayCommand(
					async () =>
					{
						IsSettingsOpen = true;
						CacheSize = await _cacheService.GetCacheSizeAsync();
					},
					() => IsSettingsOpen == false));
			}
		}

		/// <summary>
		/// Command fired when the settings flyout is closed
		/// </summary>
		public RelayCommand SettingsFlyoutClosedCommand
		{
			get
			{
				return _settingsFlyoutClosedCommand
					?? (_settingsFlyoutClosedCommand = new RelayCommand(
					async () =>
					{
						IsSettingsOpen = false;

						Folders.Clear();
						List<string> folders = await _cacheService.GetFoldersAsync();
						Folders = new ObservableCollection<string>(folders);
						SettingsFlyoutClosed msg = new SettingsFlyoutClosed();
						Messenger.Default.Send(msg);
					}));
			}
		}

		#endregion

		public MainViewModel(DialogService dialogService, ICacheService cacheService)
		{
			_dialogService = dialogService;
			_cacheService = cacheService;

			CurrentPage = new PageTransition();
			Messenger.Default.Register<NavigateToSuspectsViewMessage>(this, HandleNavigateToSuspectsMessage);
			Messenger.Default.Register<LoadSuspectListMessage>(this, HandleLoadSuspectListMessage);
			Messenger.Default.Register<LoadDemoFromAppArgument>(this, HandleLoadFromArgumentMessage);

			Task.Run(async () =>
			{
				List<string> folders = await _cacheService.GetFoldersAsync();
				Folders = new ObservableCollection<string>(folders);
			});
		}

		private void HandleLoadFromArgumentMessage(LoadDemoFromAppArgument m)
		{
			DemoDetailsView detailsView = new DemoDetailsView();
			CurrentPage.ShowPage(detailsView);
		}

		private static void HandleLoadSuspectListMessage(LoadSuspectListMessage obj)
		{
			new ViewModelLocator().SuspectList.IsLoadSuspects = false;
		}

		private void HandleNavigateToSuspectsMessage(NavigateToSuspectsViewMessage msg)
		{
			SuspectListView suspectsView = new SuspectListView();
			CurrentPage.ShowPage(suspectsView);
		}

		private static async Task<bool> CheckUpdate()
		{
			using (var httpClient = new HttpClient())
			{
				string url = AppSettings.APP_WEBSITE + "/update";
				HttpResponseMessage result = await httpClient.GetAsync(url);
				string version = await result.Content.ReadAsStringAsync();
				Version lastVersion = new Version(version);

				var resultCompare = AppSettings.APP_VERSION.CompareTo(lastVersion);
				if (resultCompare < 0)
				{
					return true;
				}
				return false;
			}
		}
	}
}