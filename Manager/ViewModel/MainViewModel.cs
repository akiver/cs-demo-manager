using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Windows.Forms;
using Core;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using GalaSoft.MvvmLight.Messaging;
using MahApps.Metro.Controls.Dialogs;
using Manager.Internals;
using Manager.Messages;
using Manager.Services;
using Newtonsoft.Json;
using Services.Concrete.Movie;
using Services.Interfaces;
using Services.Models.GitHub;

namespace Manager.ViewModel
{
    public class MainViewModel : ViewModelBase
    {
        #region Properties

        private bool _isSettingsOpen;

        private RelayCommand _settingsFlyoutOpendedCommand;

        private RelayCommand _settingsFlyoutClosedCommand;

        private ObservableCollection<string> _folders = new ObservableCollection<string>();

        private string _selectedFolder;

        private RelayCommand _addFolderCommand;

        private RelayCommand<string> _removeFolderCommand;

        public string CreditsText => AppSettings.APP_NAME + " " + AppSettings.APP_VERSION + " " + Properties.Resources.By + " " + AppSettings.AUTHOR;

        private readonly IDialogService _dialogService;

        private readonly IDemosService _demosService;

        private RelayCommand _windowLoadedCommand;

        private RelayCommand _windowClosedCommand;

        private RelayCommand<string> _handleHyperLinkCommand;

        private RelayCommand<string> _copyTextCommand;

        private readonly ICacheService _cacheService;

        public List<string> Contributors => App.Contributors.ToList();

        public List<string> Translators => App.Translators.ToList();

        #endregion

        #region Accessors

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
                                   await _dialogService.ShowMessageAsync(Properties.Resources.DialogCsgoNotDetected, MessageDialogStyle.Affirmative);
                               }

                               // Check if the dummy file created from the installer exists
                               // If it's the case it means it's the first time that the app is launched and a cache clear is required
                               if (_cacheService.ContainsDemos() && _cacheService.HasDummyCacheFile())
                               {
                                   var saveCustomData = await _dialogService.ShowMessageAsync(Properties.Resources.DialogUpdateRequireClearCache,
                                       MessageDialogStyle.AffirmativeAndNegative);
                                   if (saveCustomData == MessageDialogResult.Affirmative)
                                   {
                                       SaveFileDialog saveCustomDataDialog = new SaveFileDialog
                                       {
                                           FileName = "backup.json",
                                           Filter = "JSON file (*.json)|*.json",
                                       };

                                       if (saveCustomDataDialog.ShowDialog() == DialogResult.OK)
                                       {
                                           try
                                           {
                                               await _cacheService.CreateBackupCustomDataFile(saveCustomDataDialog.FileName);
                                               await _dialogService.ShowMessageAsync(Properties.Resources.DialogBackupCreated,
                                                   MessageDialogStyle.Affirmative);
                                           }
                                           catch (Exception e)
                                           {
                                               Logger.Instance.Log(e);
                                               await _dialogService.ShowErrorAsync(Properties.Resources.DialogErrorWhileExportingCustomData,
                                                   MessageDialogStyle.Affirmative);
                                           }
                                       }
                                   }

                                   // Clear cache even if user didn't want to backup his custom data
                                   await _cacheService.ClearDemosFile();
                                   _cacheService.DeleteDummyCacheFile();
                               }

                               if (_cacheService.HasDummyCacheFile())
                               {
                                   _cacheService.DeleteDummyCacheFile();
                               }

                               // Check for update
                               if (AppSettings.IsInternetConnectionAvailable())
                               {
                                   if (Properties.Settings.Default.EnableCheckUpdate)
                                   {
                                       string newRealaseDownloadUrl = await GetNewReleaseDownloadUrl();
                                       if (newRealaseDownloadUrl != null)
                                       {
                                           var download = await _dialogService.ShowMessageAsync(Properties.Resources.DialogNewVersionAvailable,
                                               MessageDialogStyle.AffirmativeAndNegative);
                                           if (download == MessageDialogResult.Affirmative)
                                           {
                                               Process.Start(newRealaseDownloadUrl);
                                           }
                                       }
                                   }

                                   if (Properties.Settings.Default.EnableHlae)
                                   {
                                       // check for HLAE update
                                       if (HlaeService.GetHlaeVersion() != null)
                                       {
                                           bool isUpdateAvailable = await HlaeService.IsUpdateAvailable();
                                           if (isUpdateAvailable)
                                           {
                                               var download = await _dialogService.ShowMessageAsync(
                                                   Properties.Resources.DialogNewHlaeVersionAvailable, MessageDialogStyle.AffirmativeAndNegative);
                                               if (download == MessageDialogResult.Affirmative)
                                               {
                                                   bool hlaeUpdated = await HlaeService.UpgradeHlae();
                                                   if (hlaeUpdated)
                                                   {
                                                       await _dialogService.ShowMessageAsync(Properties.Resources.DialogHlaeUpdated,
                                                           MessageDialogStyle.Affirmative);
                                                   }
                                                   else
                                                   {
                                                       await _dialogService.ShowErrorAsync(Properties.Resources.DialogHlaeUpdateFailed,
                                                           MessageDialogStyle.Affirmative);
                                                   }
                                               }
                                           }
                                       }
                                       else
                                       {
                                           // inform that HLAE isn't installed
                                           var installHlae = await _dialogService.ShowMessageAsync(Properties.Resources.DialogHlaeNotFound,
                                               MessageDialogStyle.AffirmativeAndNegative);
                                           if (installHlae == MessageDialogResult.Affirmative)
                                           {
                                               bool isHlaeInstalled = await HlaeService.UpgradeHlae();
                                               if (isHlaeInstalled)
                                               {
                                                   await _dialogService.ShowMessageAsync(Properties.Resources.DialogHlaeInstalled,
                                                       MessageDialogStyle.Affirmative);
                                               }
                                               else
                                               {
                                                   await _dialogService.ShowErrorAsync(Properties.Resources.DialogHlaeInstallationFailed,
                                                       MessageDialogStyle.Affirmative);
                                               }
                                           }
                                           else
                                           {
                                               await _dialogService.ShowMessageAsync(Properties.Resources.DialogHlaeRequired,
                                                   MessageDialogStyle.Affirmative);
                                               new ViewModelLocator().Settings.EnableHlae = false;
                                           }
                                       }
                                   }
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
                                   SelectedPath = Path.GetPathRoot(Environment.GetFolderPath(Environment.SpecialFolder.System)),
                               };

                               DialogResult result = folderDialog.ShowDialog();
                               if (result != DialogResult.OK)
                               {
                                   return;
                               }

                               string path = Path.GetFullPath(folderDialog.SelectedPath).ToLower();
                               if (Folders.Contains(path))
                               {
                                   return;
                               }

                               bool isAdded = await _cacheService.AddFolderAsync(path);
                               if (isAdded)
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
                           async folder =>
                           {
                               bool isRemoved = await _cacheService.RemoveFolderAsync(folder);
                               if (isRemoved)
                               {
                                   Folders.Remove(folder);
                               }
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
                           () =>
                           {
                               IsSettingsOpen = true;
                               SettingsFlyoutOpenedMessage msg = new SettingsFlyoutOpenedMessage();
                               Messenger.Default.Send(msg);
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

        /// <summary>
        /// Command to copy text to clipboard
        /// </summary>
        public RelayCommand<string> CopyTextCommand => _copyTextCommand
                                                       ?? (_copyTextCommand = new RelayCommand<string>(Clipboard.SetText));

        public RelayCommand<string> HandleHyperLinkCommand
        {
            get
            {
                return _handleHyperLinkCommand
                       ?? (_handleHyperLinkCommand = new RelayCommand<string>(
                           link => { Process.Start(link); }));
            }
        }

        #endregion

        public MainViewModel(IDialogService dialogService, ICacheService cacheService, IDemosService demosService)
        {
            _dialogService = dialogService;
            _cacheService = cacheService;
            _demosService = demosService;

            Messenger.Default.Register<NavigateToSuspectsViewMessage>(this, HandleNavigateToSuspectsMessage);
            Messenger.Default.Register<LoadSuspectListMessage>(this, HandleLoadSuspectListMessage);
            Messenger.Default.Register<LoadDemoFromAppArgument>(this, HandleLoadFromArgumentMessage);
            Messenger.Default.Register<DownloadDemosMessage>(this, HandleDownloadDemosMessage);

            Task.Run(async () =>
            {
                List<string> folders = await _cacheService.GetFoldersAsync();
                Folders = new ObservableCollection<string>(folders);
            });
        }

        private void HandleDownloadDemosMessage(DownloadDemosMessage obj)
        {
            Navigation.ShowDemoList();
        }

        private async void HandleLoadFromArgumentMessage(LoadDemoFromAppArgument m)
        {
            var demo = await _demosService.GetDemoHeaderAsync(m.DemoPath);
            if (_cacheService.HasDemoInCache(demo.Id))
            {
                demo = await _cacheService.GetDemoDataFromCache(demo.Id);
            }
            Navigation.ShowDemoDetails(demo);
        }

        private static void HandleLoadSuspectListMessage(LoadSuspectListMessage obj)
        {
            new ViewModelLocator().SuspectList.IsLoadSuspects = false;
        }

        private void HandleNavigateToSuspectsMessage(NavigateToSuspectsViewMessage msg)
        {
            Navigation.ShowSuspectList();
        }

        private static async Task<string> GetNewReleaseDownloadUrl()
        {
            using (var httpClient = new HttpClient())
            {
                try
                {
                    ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
                    httpClient.DefaultRequestHeaders.Add("User-Agent", "csgo-demos-manager");
                    string url = "https://api.github.com/repos/akiver/csgo-demos-manager/releases/latest";
                    HttpResponseMessage response = await httpClient.GetAsync(url);
                    string json = await response.Content.ReadAsStringAsync();
                    Release release = await Task.Factory.StartNew(() => JsonConvert.DeserializeObject<Release>(json));
                    string version = release.TagName;
                    if (version.StartsWith("v"))
                    {
                        version = version.Substring(1, version.Length - 1);
                    }

                    Version lastVersion = new Version(version);

                    var resultCompare = AppSettings.APP_VERSION.CompareTo(lastVersion);
                    if (resultCompare < 0 && release.Assets.Count > 0)
                    {
                        string releaseUrl = release.Assets[0].BrowserDownloadUrl;
                        return releaseUrl;
                    }

                    return null;
                }
                catch (Exception e)
                {
                    Logger.Instance.Log(e);
                    return null;
                }
            }
        }
    }
}
