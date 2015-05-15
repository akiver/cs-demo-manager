using System;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using System.Collections.ObjectModel;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using System.Windows.Forms;
using CSGO_Demos_Manager.Views;
using GalaSoft.MvvmLight.Messaging;
using WpfPageTransitions;
using CSGO_Demos_Manager.Messages;
using CSGO_Demos_Manager.Services;
using MahApps.Metro.Controls.Dialogs;

namespace CSGO_Demos_Manager.ViewModel
{
	public class MainViewModel : ViewModelBase
	{

		# region Properties

		private PageTransition _currentPage;

		private bool _isSettingsOpen;

		public RelayCommand ToggleSettingsFlyOutCommand { get; set; }

		public RelayCommand SettingsFlyoutClosedCommand { get; set; }

		ObservableCollection<string> _folders;

		private string _selectedFolder;

		private RelayCommand _addFolderCommand;

		private RelayCommand<string> _removeFolderCommand;

		public string CreditsText => AppSettings.APP_NAME + " " + AppSettings.APP_VERSION + " by " + AppSettings.AUTHOR;

		private readonly DialogService _dialogService;

		private RelayCommand _windowLoadedCommand;

		private RelayCommand _windowClosedCommand;

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

						if (Properties.Settings.Default.EnableCheckUpdate)
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
							Properties.Settings.Default.LastFolder = "";
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
					() =>
					{
						FolderBrowserDialog folderDialog = new FolderBrowserDialog
						{
							SelectedPath = Path.GetPathRoot(Environment.GetFolderPath(Environment.SpecialFolder.System))
					};

						DialogResult result = folderDialog.ShowDialog();
						if (result != DialogResult.OK) return;
						string path = Path.GetFullPath(folderDialog.SelectedPath).ToLower();
						if (Folders.Contains(path)) return;
						if (AppSettings.AddFolder(path))
						{
							Folders.Add(path);
						}
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
					f =>
					{
						if (!RemoveFolderCommand.CanExecute(null))
						{
							return;
						}
						Folders.Remove(f);
						AppSettings.RemoveFolder(f);
					},
					f => SelectedFolder != null));
			}
		}

		#endregion

		public MainViewModel(DialogService dialogService)
		{
			_dialogService = dialogService;

			CurrentPage = new PageTransition();
			HomeView homeView = new HomeView();
			CurrentPage.ShowPage(homeView);

			Folders = AppSettings.GetFolders();

			ToggleSettingsFlyOutCommand = new RelayCommand(() =>
			{
				IsSettingsOpen = true;
			}, () => IsSettingsOpen == false);

			SettingsFlyoutClosedCommand = new RelayCommand(() =>
			{
				IsSettingsOpen = false;

				Folders.Clear();
				Folders = AppSettings.GetFolders();

				RefreshDemosMessage msg = new RefreshDemosMessage();
				Messenger.Default.Send(msg);
			});
		}


		private static async Task<bool> CheckUpdate()
		{
			using (var httpClient = new HttpClient())
			{
				//  Grab general infos from user
				string url = AppSettings.APP_WEBSITE + "/update";
				HttpResponseMessage result = await httpClient.GetAsync(url);
				string version = await result.Content.ReadAsStringAsync();

				Version lastVersion = new Version(version);
				Version currentVersion = new Version(AppSettings.APP_VERSION);

				var resultCompare = currentVersion.CompareTo(lastVersion);
				if (resultCompare < 0)
				{
					return true;
				}
				return false;
			}
		}
	}
}