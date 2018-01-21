using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Windows;
using System.Windows.Input;
using Core;
using Core.Models;
using Hardcodet.Wpf.TaskbarNotification;

namespace SuspectsBot
{
	public class NotifyIconViewModel : INotifyPropertyChanged
	{
		private readonly Bot _bot;

		private readonly Bridge _bridge;

		/// <summary>
		/// Contains SteamID that has to be send to CSGO DM
		/// </summary>
		private readonly List<string> _bannedSteamIdList;

		public ObservableCollection<Delay> Delays { get; set; }

		public ObservableCollection<Language> Languages { get; set; }

		public bool SendDownloadNotificationOnGameClosed { get; set; } = true;

		public string IconToolTipText
		{
			get
			{
				string text = "CSGO Suspects BOT ";
				text += _bot.IsRunning ? Properties.Resources.IsRunning : Properties.Resources.IsNotRunning;
				return text;
			}
		}

		public bool IsLaunchAtStartup => Properties.Settings.Default.LaunchAtStartup;

		public bool SendDownloadNotifications => Properties.Settings.Default.SendDownloadNotifications;

		public ICommand ShowAppCommand
		{
			get
			{
				return new DelegateCommand
				{
					CommandAction = param => _bridge.StartCsgoDemosManager()
				};
			}
		}

		public ICommand ShowSuspectsListCommand
		{
			get
			{
				return new DelegateCommand
				{
					CommandAction = param => _bridge.ShowSuspectsList()
				};
			}
		}

		public ICommand QuitCommand
		{
			get
			{
				return new DelegateCommand
				{
					CommandAction = param => Application.Current.Shutdown()
				};
			}
		}

		public ICommand StartCommand
		{
			get
			{
				return new DelegateCommand
				{
					CanExecuteFunc = param => !_bot.IsRunning,
					CommandAction = param =>
					{
						_bot.Start();
						OnPropertyChanged("IconToolTipText");
					}
				};
			}
		}

		public ICommand StopCommand
		{
			get
			{
				return new DelegateCommand
				{
					CanExecuteFunc = param => _bot.IsRunning,
					CommandAction = param =>
					{
						_bot.Stop();
						OnPropertyChanged("IconToolTipText");
					}
				};
			}
		}

		public ICommand ChangeDelayCommand
		{
			get
			{
				return new DelegateCommand
				{
					CanExecuteFunc = param =>
					{
						Delay delay = param as Delay;
						return delay != null && delay.Value != Properties.Settings.Default.CheckDelayMinutes;
					},
					CommandAction = param =>
					{
						Delay delay = param as Delay;
						if (delay != null)
						{
							Properties.Settings.Default.CheckDelayMinutes = delay.Value;
							Properties.Settings.Default.Save();
							foreach (Delay d in Delays)
							{
								d.IsChecked = d.Value == delay.Value;
							}
						}
					}
				};
			}
		}

		public ICommand CheckNowCommand
		{
			get
			{
				return new DelegateCommand
				{
					CanExecuteFunc = param => AppSettings.IsInternetConnectionAvailable(),
					CommandAction = async param =>
					{
						bool hasNewSuspect = await _bot.Check();
						if (!hasNewSuspect)
						{
							App.NotifyIcon.ShowBalloonTip(AppSettings.APP_NAME, Properties.Resources.BalloonNoNewSuspectsFound, BalloonIcon.Info);
						}
					}
				};
			}
		}

		public ICommand ToggleLaunchAtStartupCommand
		{
			get
			{
				return new DelegateCommand
				{
					CommandAction = param =>
					{
						Properties.Settings.Default.LaunchAtStartup = !Properties.Settings.Default.LaunchAtStartup;
						Properties.Settings.Default.Save();
						if (Properties.Settings.Default.LaunchAtStartup)
							Utils.CreateShortcut();
						else
							Utils.DeleteShortcut();
						OnPropertyChanged("IsLaunchAtStartup");
					}
				};
			}
		}

		public ICommand ToggleSendDownloadNotificationsCommand
		{
			get
			{
				return new DelegateCommand
				{
					CommandAction = param =>
					{
						Properties.Settings.Default.SendDownloadNotifications = !Properties.Settings.Default.SendDownloadNotifications;
						Properties.Settings.Default.Save();
						OnPropertyChanged("SendDownloadNotifications");
					}
				};
			}
		}

		public ICommand ChangeLanguageCommand
		{
			get
			{
				return new DelegateCommand
				{
					CanExecuteFunc = param =>
					{
						Language language = param as Language;
						return language != null && language.Key != Properties.Settings.Default.Language;
					},
					CommandAction = param =>
					{
						Language language = param as Language;
						if (language != null)
						{
							Properties.Settings.Default.Language = language.Key;
							Properties.Settings.Default.Save();
							System.Diagnostics.Process.Start(Application.ResourceAssembly.Location);
							Application.Current.Shutdown();
						}
					}
				};
			}
		}

		public NotifyIconViewModel()
		{
			_bot = new Bot();
			_bridge = new Bridge();
			_bannedSteamIdList = new List<string>();
			_bot.SuspectBanned += HandleSuspectBanned;
			_bot.CsgoClosed += HandleCsgoClosed;
			Delays = new ObservableCollection<Delay>
			{
				new Delay
				{
					Value = 30,
					Title = string.Format(Properties.Resources.Xminutes, 30),
					IsChecked = Properties.Settings.Default.CheckDelayMinutes == 30
				},
				new Delay
				{
					Value = 60,
					Title = string.Format(Properties.Resources.Xhour, "1"),
					IsChecked = Properties.Settings.Default.CheckDelayMinutes == 60
				},
				new Delay
				{
					Value = 360,
					Title = string.Format(Properties.Resources.Xhours, 6),
					IsChecked = Properties.Settings.Default.CheckDelayMinutes == 360
				},
				new Delay
				{
					Value = 720,
					Title = string.Format(Properties.Resources.Xhours, 12),
					IsChecked = Properties.Settings.Default.CheckDelayMinutes == 720
				},
				new Delay
				{
					Value = 1440,
					Title = string.Format(Properties.Resources.Xhours, 24),
					IsChecked = Properties.Settings.Default.CheckDelayMinutes == 1440
				}
			};
			Languages = new ObservableCollection<Language>(AppSettings.LANGUAGES.Where(l => l.IsEnabled));
			foreach (Language language in Languages)
			{
				if (Properties.Settings.Default.Language == language.Key)
				{
					language.IsSelected = true;
				}
			}
		}

		public void UpdateCsgoDmStatus(bool isRunning)
		{
			_bot.IsCsgoDmLoaded = isRunning;
		}

		private void HandleSuspectBanned(object sender, SuspectBannedEventArgs args)
		{
			if (args.SteamIdList.Count > 0)
			{
				// send to CSGO DM the new account banned count
				_bridge.SendSuspectBannedCount(args.SteamIdList.Count);

				foreach (string steamId in args.SteamIdList)
				{
					if (!_bannedSteamIdList.Contains(steamId))
						_bannedSteamIdList.Add(steamId);
				}
				App.NotifyIcon.ShowBalloonTip(AppSettings.APP_NAME, string.Format(Properties.Resources.XsuspectsHaveBeenBanned, _bannedSteamIdList.Count), BalloonIcon.Warning);
				App.NotifyIcon.TrayBalloonTipClicked += NewSuspectsBalloonClicked;
			}
		}

		private void NewSuspectsBalloonClicked(object sender, RoutedEventArgs routedEventArgs)
		{
			bool isStarted = _bridge.ShowSuspectsList();
			if (isStarted) _bridge.SendSteamIdList(_bannedSteamIdList);
			App.NotifyIcon.TrayBalloonTipClicked -= NewSuspectsBalloonClicked;
		}

		private void HandleCsgoClosed(object sender, CsgoClosedEvent args)
		{
			if (SendDownloadNotificationOnGameClosed)
			{
				App.NotifyIcon.ShowBalloonTip(AppSettings.APP_NAME, Properties.Resources.DownloadDemos, BalloonIcon.Info);
				App.NotifyIcon.TrayBalloonTipClicked += CsgoClosedBalloonClicked;
			}
		}

		private void CsgoClosedBalloonClicked(object sender, RoutedEventArgs routedEventArgs)
		{
			_bridge.DownloadDemos();
			App.NotifyIcon.TrayBalloonTipClicked -= CsgoClosedBalloonClicked;
		}

		public event PropertyChangedEventHandler PropertyChanged;

		public void OnPropertyChanged(string propertyName)
		{
			PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
		}
	}
}
