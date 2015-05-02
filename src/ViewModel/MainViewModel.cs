using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using System.Collections.ObjectModel;
using System.Windows.Forms;
using CSGO_Demos_Manager.Views;
using GalaSoft.MvvmLight.Messaging;
using WpfPageTransitions;
using CSGO_Demos_Manager.Messages;

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
							SelectedPath = AppSettings.GetCsgoPath()
						};

						DialogResult result = folderDialog.ShowDialog();
						if (result != DialogResult.OK) return;
						if (Folders.Contains(folderDialog.SelectedPath)) return;
						Folders.Add(folderDialog.SelectedPath);
						AppSettings.AddFolder(folderDialog.SelectedPath);
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

		public MainViewModel()
		{
			CurrentPage = new PageTransition();
			HomeView homeView = new HomeView();
			CurrentPage.ShowPage(homeView);

			_folders = AppSettings.GetFolders();

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
	}
}