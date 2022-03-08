using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using DemoInfo;
using GalaSoft.MvvmLight.CommandWpf;
using MahApps.Metro.Controls.Dialogs;
using Manager.Models;
using Manager.Services;
using Manager.ViewModel.Shared;
using Manager.Views.Demos;
using Services.Interfaces;
using Demo = Core.Models.Demo;
using Player = Core.Models.Player;
using Round = Core.Models.Round;

namespace Manager.ViewModel.Demos
{
    public class DemoDamagesViewModel : BaseViewModel
    {
        #region Properties

        private Demo _demo;

        private RelayCommand<Demo> _backToDemoDetailsCommand;

        private double _totalDamage;

        private double _damageHeadValue;

        private double _damageChestValue;

        private double _damageStomachValue;

        private double _damageLeftArmValue;

        private double _damageRightArmValue;

        private double _damageLeftLegValue;

        private double _damageRightLegValue;

        private double _damagePercentHead;

        private double _damagePercentStomach;

        private double _damagePercentChest;

        private double _damagePercentRightLeg;

        private double _damagePercentLeftLeg;

        private double _damagePercentRightArm;

        private double _damagePercentLeftArm;

        private List<ComboboxSelector> _teamSelectors = new List<ComboboxSelector>();

        private ComboboxSelector _selectedTeam;

        private Player _selectedPlayer;

        private Round _selectedRound;

        private bool _selectAllRounds = true;

        private bool _selectAllPlayers = true;

        private readonly IDialogService _dialogService;

        private readonly IDamageService _damageService;

        private RelayCommand _updateCommand;

        #endregion

        #region Accessors

        public Demo Demo
        {
            get => _demo;
            set { Set(() => Demo, ref _demo, value); }
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
                if (value == null)
                {
                    return;
                }

                if (SelectedPlayer != null)
                {
                    SelectedPlayer = null;
                }

                SelectAllPlayers = false;
            }
        }

        public Player SelectedPlayer
        {
            get { return _selectedPlayer; }
            set
            {
                Set(() => SelectedPlayer, ref _selectedPlayer, value);
                if (value == null)
                {
                    return;
                }

                if (SelectedTeam != null)
                {
                    SelectedTeam = null;
                }

                SelectAllPlayers = false;
            }
        }

        public Round SelectedRound
        {
            get { return _selectedRound; }
            set
            {
                Set(() => SelectedRound, ref _selectedRound, value);
                if (value == null)
                {
                    return;
                }

                if (SelectAllRounds)
                {
                    SelectAllRounds = false;
                }
            }
        }

        public bool SelectAllRounds
        {
            get { return _selectAllRounds; }
            set
            {
                Set(() => SelectAllRounds, ref _selectAllRounds, value);
                if (value)
                {
                    SelectedRound = null;
                }
            }
        }

        public bool SelectAllPlayers
        {
            get { return _selectAllPlayers; }
            set
            {
                Set(() => SelectAllPlayers, ref _selectAllPlayers, value);
                if (value)
                {
                    SelectedTeam = null;
                }

                if (value)
                {
                    SelectedPlayer = null;
                }
            }
        }

        public double TotalDamage
        {
            get { return _totalDamage; }
            set { Set(() => TotalDamage, ref _totalDamage, value); }
        }

        public double DamageHeadValue
        {
            get { return _damageHeadValue; }
            set { Set(() => DamageHeadValue, ref _damageHeadValue, value); }
        }

        public double DamageChestValue
        {
            get { return _damageChestValue; }
            set { Set(() => DamageChestValue, ref _damageChestValue, value); }
        }

        public double DamageStomachValue
        {
            get { return _damageStomachValue; }
            set { Set(() => DamageStomachValue, ref _damageStomachValue, value); }
        }

        public double DamageLeftArmValue
        {
            get { return _damageLeftArmValue; }
            set { Set(() => DamageLeftArmValue, ref _damageLeftArmValue, value); }
        }

        public double DamageRightArmValue
        {
            get { return _damageRightArmValue; }
            set { Set(() => DamageRightArmValue, ref _damageRightArmValue, value); }
        }

        public double DamageLeftLegValue
        {
            get { return _damageLeftLegValue; }
            set { Set(() => DamageLeftLegValue, ref _damageLeftLegValue, value); }
        }

        public double DamageRightLegValue
        {
            get { return _damageRightLegValue; }
            set { Set(() => DamageRightLegValue, ref _damageRightLegValue, value); }
        }

        public double DamagePercentHead
        {
            get { return _damagePercentHead; }
            set { Set(() => DamagePercentHead, ref _damagePercentHead, value); }
        }

        public double DamagePercentStomach
        {
            get { return _damagePercentStomach; }
            set { Set(() => DamagePercentStomach, ref _damagePercentStomach, value); }
        }

        public double DamagePercentChest
        {
            get { return _damagePercentChest; }
            set { Set(() => DamagePercentChest, ref _damagePercentChest, value); }
        }

        public double DamagePercentLeftArm
        {
            get { return _damagePercentLeftArm; }
            set { Set(() => DamagePercentLeftArm, ref _damagePercentLeftArm, value); }
        }

        public double DamagePercentRightArm
        {
            get { return _damagePercentRightArm; }
            set { Set(() => DamagePercentRightArm, ref _damagePercentRightArm, value); }
        }

        public double DamagePercentLeftLeg
        {
            get { return _damagePercentLeftLeg; }
            set { Set(() => DamagePercentLeftLeg, ref _damagePercentLeftLeg, value); }
        }

        public double DamagePercentRightLeg
        {
            get { return _damagePercentRightLeg; }
            set { Set(() => DamagePercentRightLeg, ref _damagePercentRightLeg, value); }
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
                               var detailsViewModel = new ViewModelLocator().DemoDetails;
                               detailsViewModel.Demo = demo;
                               var mainViewModel = new ViewModelLocator().Main;
                               DemoDetailsView detailsView = new DemoDetailsView();
                               mainViewModel.CurrentPage.ShowPage(detailsView);
                               Cleanup();
                           },
                           demo => Demo != null));
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
                               if (!Demo.PlayersHurted.Any())
                               {
                                   await _dialogService.ShowMessageAsync(Properties.Resources.DialogNoDamagesDataFound,
                                       MessageDialogStyle.Affirmative);
                                   IsBusy = false;
                                   return;
                               }

                               List<long> steamIdList = new List<long>();
                               List<int> roundNumberList = new List<int>();

                               // A team has been selected
                               if (SelectedTeam != null)
                               {
                                   steamIdList.AddRange(SelectedTeam.Id == "CT"
                                       ? Demo.TeamCT.Players.Select(player => player.SteamId)
                                       : Demo.Players.Select(player => player.SteamId));
                               }

                               // All players selected
                               if (SelectAllPlayers)
                               {
                                   steamIdList.AddRange(Demo.Players.Select(player => player.SteamId));
                               }

                               // only 1 player selected
                               if (SelectedPlayer != null)
                               {
                                   steamIdList.Add(Demo.Players.First(p => p.SteamId == SelectedPlayer.SteamId).SteamId);
                               }

                               // All rounds selected
                               if (SelectAllRounds)
                               {
                                   roundNumberList.AddRange(Demo.Rounds.Select(round => round.Number));
                               }

                               // only 1 round selected
                               if (SelectedRound != null)
                               {
                                   roundNumberList.Add(Demo.Rounds.First(r => r.Number == SelectedRound.Number).Number);
                               }

                               await LoadDatas(steamIdList, roundNumberList);
                           }, () => !IsBusy && SelectAllRounds && SelectAllPlayers || SelectAllPlayers && SelectedRound != null
                                                                                   || (SelectedTeam != null || SelectedPlayer != null) &&
                                                                                   (SelectAllRounds || SelectedRound != null)));
            }
        }

        #endregion

        public DemoDamagesViewModel(IDialogService dialogService, IDamageService damageService)
        {
            _dialogService = dialogService;
            _damageService = damageService;

            TeamSelectors.Add(new ComboboxSelector("CT", Properties.Resources.CounterTerrorists));
            TeamSelectors.Add(new ComboboxSelector("T", Properties.Resources.Terrorists));

            if (IsInDesignMode)
            {
                Application.Current.Dispatcher.Invoke(async () => { await LoadDatas(new List<long>(), new List<int>()); });
            }
        }

        private async Task LoadDatas(List<long> steamIdList, List<int> roundNumberList)
        {
            IsBusy = true;
            TotalDamage = await _damageService.GetTotalDamageAsync(Demo, steamIdList, roundNumberList);
            DamageHeadValue = await _damageService.GetHitGroupDamageAsync(Demo, Hitgroup.Head, steamIdList, roundNumberList);
            if (DamageHeadValue > 0)
            {
                DamagePercentHead = Math.Round(DamageHeadValue * 100 / TotalDamage, 1);
            }

            DamageChestValue = await _damageService.GetHitGroupDamageAsync(Demo, Hitgroup.Chest, steamIdList, roundNumberList);
            if (DamageChestValue > 0)
            {
                DamagePercentChest = Math.Round(DamageChestValue * 100 / TotalDamage, 1);
            }

            DamageLeftArmValue = await _damageService.GetHitGroupDamageAsync(Demo, Hitgroup.LeftArm, steamIdList, roundNumberList);
            if (DamageLeftArmValue > 0)
            {
                DamagePercentLeftArm = Math.Round(DamageLeftArmValue * 100 / TotalDamage, 1);
            }

            DamageRightArmValue = await _damageService.GetHitGroupDamageAsync(Demo, Hitgroup.RightArm, steamIdList, roundNumberList);
            if (DamageRightArmValue > 0)
            {
                DamagePercentRightArm = Math.Round(DamageRightArmValue * 100 / TotalDamage, 1);
            }

            DamageLeftLegValue = await _damageService.GetHitGroupDamageAsync(Demo, Hitgroup.LeftLeg, steamIdList, roundNumberList);
            if (DamageLeftLegValue > 0)
            {
                DamagePercentLeftLeg = Math.Round(DamageLeftLegValue * 100 / TotalDamage, 1);
            }

            DamageRightLegValue = await _damageService.GetHitGroupDamageAsync(Demo, Hitgroup.RightLeg, steamIdList, roundNumberList);
            if (DamageRightLegValue > 0)
            {
                DamagePercentRightLeg = Math.Round(DamageRightLegValue * 100 / TotalDamage, 1);
            }

            DamageStomachValue = await _damageService.GetHitGroupDamageAsync(Demo, Hitgroup.Stomach, steamIdList, roundNumberList);
            if (DamageStomachValue > 0)
            {
                DamagePercentStomach = Math.Round(DamageStomachValue * 100 / TotalDamage, 1);
            }

            IsBusy = false;
        }

        public override void Cleanup()
        {
            base.Cleanup();
            SelectAllPlayers = true;
            SelectAllRounds = true;
            DamageStomachValue = 0;
            DamageHeadValue = 0;
            DamageLeftArmValue = 0;
            DamageRightArmValue = 0;
            DamageLeftLegValue = 0;
            DamageRightLegValue = 0;
            DamageChestValue = 0;
        }
    }
}
