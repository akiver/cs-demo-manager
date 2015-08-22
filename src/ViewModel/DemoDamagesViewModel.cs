using System.Collections.Generic;
using System.Linq;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Events;
using CSGO_Demos_Manager.Services;
using CSGO_Demos_Manager.Views;
using DemoInfo;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using MahApps.Metro.Controls.Dialogs;

namespace CSGO_Demos_Manager.ViewModel
{
	public class DemoDamagesViewModel : ViewModelBase
	{
		#region Properties

		private Demo _currentDemo;

		private RelayCommand<Demo> _backToDemoDetailsCommand;

		private string _damageHeadValue;

		private string _damageChestValue;

		private string _damageStomachValue;

		private string _damageLeftArmValue;

		private string _damageRightArmValue;

		private string _damageLeftLegValue;

		private string _damageRightLegValue;

		private bool _isGenerating;

		private List<ComboboxSelector> _teamSelectors = new List<ComboboxSelector>();

		private ComboboxSelector _selectedTeam;

		private PlayerExtended _selectedPlayer;

		private Round _selectedRound;

		private bool _selectAllRounds = true;

		private bool _selectAllPlayers = true;

		private readonly DialogService _dialogService;

		private RelayCommand _updateCommand;

		#endregion

		#region Accessors

		public Demo CurrentDemo
		{
			get { return _currentDemo; }
			set { Set(() => CurrentDemo, ref _currentDemo, value); }
		}

		public List<ComboboxSelector> TeamSelectors
		{
			get { return _teamSelectors; }
			set { Set(() => TeamSelectors, ref _teamSelectors, value); }
		}

		public ComboboxSelector SelectedTeam
		{
			get { return _selectedTeam; }
			set
			{
				Set(() => SelectedTeam, ref _selectedTeam, value);
				if (value == null) return;
				if (SelectedPlayer != null) SelectedPlayer = null;
				SelectAllPlayers = false;
			}
		}

		public PlayerExtended SelectedPlayer
		{
			get { return _selectedPlayer; }
			set
			{
				Set(() => SelectedPlayer, ref _selectedPlayer, value);
				if (value == null) return;
				if (SelectedTeam != null) SelectedTeam = null;
				SelectAllPlayers = false;
			}
		}

		public Round SelectedRound
		{
			get { return _selectedRound; }
			set
			{
				Set(() => SelectedRound, ref _selectedRound, value);
				if (value == null) return;
				if (SelectAllRounds) SelectAllRounds = false;
			}
		}

		public bool SelectAllRounds
		{
			get { return _selectAllRounds; }
			set
			{
				Set(() => SelectAllRounds, ref _selectAllRounds, value);
				if (value) SelectedRound = null;
			}
		}

		public bool SelectAllPlayers
		{
			get { return _selectAllPlayers; }
			set
			{
				Set(() => SelectAllPlayers, ref _selectAllPlayers, value);
				if (value) SelectedTeam = null;
				if (value) SelectedPlayer = null;
			}
		}

		public bool IsGenerating
		{
			get { return _isGenerating; }
			set { Set(() => IsGenerating, ref _isGenerating, value); }
		}

		public string DamageHeadValue
		{
			get { return _damageHeadValue; }
			set { Set(() => DamageHeadValue, ref _damageHeadValue, value); }
		}

		public string DamageChestValue
		{
			get { return _damageChestValue; }
			set { Set(() => DamageChestValue, ref _damageChestValue, value); }
		}

		public string DamageStomachValue
		{
			get { return _damageStomachValue; }
			set { Set(() => DamageStomachValue, ref _damageStomachValue, value); }
		}

		public string DamageLeftArmValue
		{
			get { return _damageLeftArmValue; }
			set { Set(() => DamageLeftArmValue, ref _damageLeftArmValue, value); }
		}

		public string DamageRightArmValue
		{
			get { return _damageRightArmValue; }
			set { Set(() => DamageRightArmValue, ref _damageRightArmValue, value); }
		}

		public string DamageLeftLegValue
		{
			get { return _damageLeftLegValue; }
			set { Set(() => DamageLeftLegValue, ref _damageLeftLegValue, value); }
		}

		public string DamageRightLegValue
		{
			get { return _damageRightLegValue; }
			set { Set(() => DamageRightLegValue, ref _damageRightLegValue, value); }
		}

		#endregion

		#region Commands

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
							Cleanup();
						},
						demo => CurrentDemo != null));
			}
		}

		/// <summary>
		/// Command to update the damages stats displayed
		/// </summary>
		public RelayCommand UpdateCommand
		{
			get
			{
				return _updateCommand
					?? (_updateCommand = new RelayCommand(
					async () =>
					{
						IsGenerating = true;

						bool hasDamageData = CurrentDemo.Rounds.Any(round => round.PlayersHurted.Any());
						if (!hasDamageData)
						{
							await
								_dialogService.ShowMessageAsync("No damages data found. The demo is too old or you didn't analyze it.",
									MessageDialogStyle.Affirmative);
							IsGenerating = false;
							return;
						}

						List<PlayerExtended> players = new List<PlayerExtended>();
						List<Round> rounds = new List<Round>();

						// A team has been selected
						if (SelectedTeam != null)
						{
							players = SelectedTeam.Id == "T" ? CurrentDemo.PlayersTeam1.ToList() : CurrentDemo.PlayersTeam2.ToList();
						}

						// All players selected
						if (SelectAllPlayers) players = CurrentDemo.Players.ToList();

						// only 1 player selected
						if (SelectedPlayer != null) players.Add(CurrentDemo.Players.FirstOrDefault(p => p.SteamId == SelectedPlayer.SteamId));

						// All rounds selected
						if (SelectAllRounds) rounds = CurrentDemo.Rounds.ToList();

						// only 1 round selected
						if (SelectedRound != null) rounds.Add(CurrentDemo.Rounds.FirstOrDefault(r => r.Number == SelectedRound.Number));

						DamageHeadValue = await CurrentDemo.GetDamageAsync(Hitgroup.Head, players, rounds);
						DamageChestValue = await CurrentDemo.GetDamageAsync(Hitgroup.Chest, players, rounds);
						DamageLeftArmValue = await CurrentDemo.GetDamageAsync(Hitgroup.LeftArm, players, rounds);
						DamageRightArmValue = await CurrentDemo.GetDamageAsync(Hitgroup.RightArm, players, rounds);
						DamageLeftLegValue = await CurrentDemo.GetDamageAsync(Hitgroup.LeftLeg, players, rounds);
						DamageRightLegValue = await CurrentDemo.GetDamageAsync(Hitgroup.RightLeg, players, rounds);
						DamageStomachValue = await CurrentDemo.GetDamageAsync(Hitgroup.Stomach, players, rounds);

						IsGenerating = false;

					}, () => !IsGenerating && (SelectAllRounds && SelectAllPlayers)|| (SelectAllPlayers && SelectedRound != null)
					|| (SelectedTeam != null || SelectedPlayer != null) && (SelectAllRounds || SelectedRound != null)));
			}
		}

		#endregion

		public DemoDamagesViewModel(DialogService dialogService)
		{
			_dialogService = dialogService;

			TeamSelectors.Add(new ComboboxSelector("CT", "Counter-Terrorists"));
			TeamSelectors.Add(new ComboboxSelector("T", "Terrorists"));
		}

		public override void Cleanup()
		{
			base.Cleanup();
			SelectAllPlayers = true;
			SelectAllRounds = true;
			DamageStomachValue = string.Empty;
			DamageHeadValue = string.Empty;
			DamageLeftArmValue = string.Empty;
			DamageRightArmValue = string.Empty;
			DamageLeftLegValue = string.Empty;
			DamageRightLegValue = string.Empty;
			DamageChestValue = string.Empty;
			IsGenerating = false;
		}
	}
}
