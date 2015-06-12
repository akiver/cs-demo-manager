using System;
using System.Collections;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Services;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using GalaSoft.MvvmLight.Threading;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Data;
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

		private RelayCommand _removeSelectedSuspectsCommand;

		private RelayCommand<Suspect> _goToSuspectProfileCommand;

		private RelayCommand _refreshSuspectListCommand;

		private RelayCommand<IList> _suspectsSelectionChangedCommand;

		ObservableCollection<Suspect> _suspects;

		ObservableCollection<Suspect> _selectedsuspects;

		private ICollectionView _dataGridSuspectsCollection;

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

		public ObservableCollection<Suspect> SelectedSuspects
		{
			get { return _selectedsuspects; }
			set { Set(() => SelectedSuspects, ref _selectedsuspects, value); }
		}

		public ICollectionView DataGridSuspectsCollection
		{
			get { return _dataGridSuspectsCollection; }
			set { Set(() => DataGridSuspectsCollection, ref _dataGridSuspectsCollection, value); }
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

		public RelayCommand RemoveSuspectCommand
		{
			get
			{
				return _removeSelectedSuspectsCommand
					?? (_removeSelectedSuspectsCommand = new RelayCommand(
						async () =>
						{
							for (int i = SelectedSuspects.Count - 1; i >= 0; i--)
							{
								Console.WriteLine(SelectedSuspects[i].Nickname);
								bool removed = await _cacheService.RemoveSuspectFromCache(SelectedSuspects[i].SteamId);
								if (!removed)
								{
									await _dialogService.ShowErrorAsync("Error while deleting user.", MessageDialogStyle.Affirmative);
								}
								else
								{
									Suspects.Remove(SelectedSuspects[i]);
								}
							}

							SelectedSuspects.Clear();
							DataGridSuspectsCollection.Refresh();
							IsRefreshing = false;
						},
						() => SelectedSuspects.Any()));
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

		/// <summary>
		/// Command fired when a suspect selection is done
		/// </summary>
		public RelayCommand<IList> SuspectsSelectionChangedCommand
		{
			get
			{
				return _suspectsSelectionChangedCommand
					?? (_suspectsSelectionChangedCommand = new RelayCommand<IList>(
						suspects =>
						{
							if (IsRefreshing) return;
							if (suspects == null) return;
							SelectedSuspects.Clear();
							foreach (Suspect suspect in suspects)
							{
								SelectedSuspects.Add(suspect);
							}
						}));
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
			SelectedSuspects = new ObservableCollection<Suspect>();
			DataGridSuspectsCollection = CollectionViewSource.GetDefaultView(Suspects);

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
