using System;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Services;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using GalaSoft.MvvmLight.Threading;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using CSGO_Demos_Manager.Internals;
using MahApps.Metro.Controls.Dialogs;

namespace CSGO_Demos_Manager.ViewModel
{
	public class SuspectsViewModel : ViewModelBase
	{
		#region Properties

		private readonly ISteamService _steamService;

		private readonly ICacheService _cacheService;

		private readonly DialogService _dialogService;

		private string _suspectSteamCommunityUrl;

		private RelayCommand<string> _addSuspectCommand;

		private RelayCommand<Suspect> _removeSuspectCommand;

		private RelayCommand<Suspect> _goToSuspectProfileCommand;

		private RelayCommand _refreshSuspectListCommand;

		ObservableCollection<Suspect> _suspects;

		Suspect _selectedSuspect;

		private bool _isRefreshing;

		#endregion

		#region Accessors

		public Suspect SelectedSuspect
		{
			get { return _selectedSuspect; }
			set { Set(() => SelectedSuspect, ref _selectedSuspect, value); }
		}

		public ObservableCollection<Suspect> Suspects
		{
			get { return _suspects; }
			set { Set(() => Suspects, ref _suspects, value); }
		}

		public string SuspectSteamCommunityUrl
		{
			get { return _suspectSteamCommunityUrl; }
			set { Set(() => SuspectSteamCommunityUrl, ref _suspectSteamCommunityUrl, value); }
		}

		public bool IsRefreshing
		{
			get { return _isRefreshing; }
			set { Set(() => IsRefreshing, ref _isRefreshing, value); }
		}

		#endregion

		#region Commands

		public RelayCommand<string> AddSuspectCommand
		{
			get
			{
				return _addSuspectCommand
					?? (_addSuspectCommand = new RelayCommand<string>(
						async steamCommunityUrl =>
						{
							if (!AppSettings.IsInternetConnectionAvailable())
							{
								await _dialogService.ShowNoInternetConnectionAsync();
								return;
							}

							IsRefreshing = true;
							SuspectSteamCommunityUrl = null;

							try
							{
								Suspect suspect = await _steamService.GetBanStatusForUser(steamCommunityUrl);

								if (suspect == null)
								{
									await _dialogService.ShowErrorAsync("User not found.", MessageDialogStyle.Affirmative);
									IsRefreshing = false;
									return;
								}

								bool added = await _cacheService.AddSuspectToCache(suspect.SteamId);
								if (added)
								{
									Suspects.Add(suspect);
									if (suspect.VacBanned || suspect.GameBanCount > 0)
									{
										await _cacheService.AddSuspectToBannedList(suspect);
									}
								}
							}
							catch (Exception e)
							{
								Logger.Instance.Log(e);
								await _dialogService.ShowErrorAsync("Error while trying to get suspects information.", MessageDialogStyle.Affirmative);
							}

							IsRefreshing = false;
							CommandManager.InvalidateRequerySuggested();
						},
						steamCommunityUrl => SuspectSteamCommunityUrl != null));
			}
		}

		public RelayCommand<Suspect> RemoveSuspectCommand
		{
			get
			{
				return _removeSuspectCommand
					?? (_removeSuspectCommand = new RelayCommand<Suspect>(
						async suspect =>
						{
							Suspects.Remove(suspect);

							// Call cache service
							bool removed = await _cacheService.RemoveSuspectFromCache(suspect.SteamId);
							if (!removed)
							{
								await _dialogService.ShowErrorAsync("Error while deleting user.", MessageDialogStyle.Affirmative);
							}

							IsRefreshing = false;
						},
						suspect => SelectedSuspect != null));
			}
		}

		public RelayCommand<Suspect> GoToSuspectProfileCommand
		{
			get
			{
				return _goToSuspectProfileCommand
					?? (_goToSuspectProfileCommand = new RelayCommand<Suspect>(
						suspect =>
						{
							System.Diagnostics.Process.Start(suspect.ProfileUrl);
						},
						suspect => SelectedSuspect != null));
			}
		}

		public RelayCommand RefreshSuspectListCommand
		{
			get
			{
				return _refreshSuspectListCommand
					?? (_refreshSuspectListCommand = new RelayCommand(
						async () =>
						{
							IsRefreshing = true;
							await LoadSuspects();
							IsRefreshing = false;
						}, () => IsRefreshing == false));
			}
		}

		#endregion

		public SuspectsViewModel(ISteamService steamService, ICacheService cacheService, DialogService dialogService)
		{
			_steamService = steamService;
			_cacheService = cacheService;
			_dialogService = dialogService;

			if (IsInDesignModeStatic)
			{
				DispatcherHelper.Initialize();
			}

			Suspects = new ObservableCollection<Suspect>();

			DispatcherHelper.CheckBeginInvokeOnUI(
			async () =>
			{
				IsRefreshing = true;
				await LoadSuspects();
				IsRefreshing = false;
			});
		}

		private async Task LoadSuspects()
		{
			if (!AppSettings.IsInternetConnectionAvailable())
			{
				await _dialogService.ShowNoInternetConnectionAsync();
				return;
			}

			Suspects.Clear();

			List<string> suspectsIdList = await _cacheService.GetSuspectsListFromCache();
			if (suspectsIdList.Any())
			{
				try
				{
					IEnumerable<Suspect> suspects = await _steamService.GetBanStatusForUserList(suspectsIdList);
					foreach (Suspect suspect in suspects)
					{
						Suspects.Add(suspect);
					}
				}
				catch (Exception e)
				{
					Logger.Instance.Log(e);
					await _dialogService.ShowErrorAsync("Error while trying to get suspects information.", MessageDialogStyle.Affirmative);
				}
			}
		}

		public override void Cleanup()
		{
			base.Cleanup();
			SelectedSuspect = null;
			Suspects.Clear();
		}
	}
}
