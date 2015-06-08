using System;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Services;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using MahApps.Metro.Controls.Dialogs;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Windows.Forms;
using System.Windows.Input;
using System.Windows.Media.Imaging;
using CSGO_Demos_Manager.Exceptions.Map;
using CSGO_Demos_Manager.Internals;
using CSGO_Demos_Manager.Services.Map;
using CSGO_Demos_Manager.Views;

namespace CSGO_Demos_Manager.ViewModel
{
	public class HeatmapViewModel : ViewModelBase
	{

		#region Properties

		private RelayCommand _generateCommand;

		private RelayCommand _exportCommand;

		private Demo _currentDemo;

		private WriteableBitmap _overviewLayer;

		private WriteableBitmap _colorsLayer;

		private List<HeatmapPoint> _points = new List<HeatmapPoint>();

		private readonly DialogService _dialogService;

		private HeatmapService _heatmapService;

		private List<ComboboxSelector> _eventSelectors = new List<ComboboxSelector>();

		private List<ComboboxSelector> _teamSelectors = new List<ComboboxSelector>();

		private ComboboxSelector _currentEventSelector;

		private ComboboxSelector _currentTeamSelector;

		private PlayerExtended _selectedPlayer;

		private Round _selectedRound;

		private RelayCommand<Demo> _backToDemoDetailsCommand;

		private bool _isGenerating;

		private bool _hasGeneratedHeatmap;

		private readonly IDemosService _demosService;

		private byte _opacity = 150;

		private bool _selectAllRounds;

		#endregion

		#region Accessors

		public Demo CurrentDemo
		{
			get { return _currentDemo; }
			set { Set(() => CurrentDemo, ref _currentDemo, value); }
		}

		public WriteableBitmap ColorsLayer
		{
			get { return _colorsLayer; }
			set { Set(() => ColorsLayer, ref _colorsLayer, value); }
		}

		public WriteableBitmap OverviewLayer
		{
			get { return _overviewLayer; }
			set { Set(() => OverviewLayer, ref _overviewLayer, value); }
		}

		public List<ComboboxSelector> EventSelectors
		{
			get { return _eventSelectors; }
			set { Set(() => EventSelectors, ref _eventSelectors, value); }
		}

		public ComboboxSelector CurrentEventSelector
		{
			get { return _currentEventSelector; }
			set { Set(() => CurrentEventSelector, ref _currentEventSelector, value); }
		}

		public ComboboxSelector CurrentTeamSelector
		{
			get { return _currentTeamSelector; }
			set
			{
				Set(() => CurrentTeamSelector, ref _currentTeamSelector, value);
				if (value == null) return;
				if (SelectedPlayer != null) SelectedPlayer = null;
			}
		}

		public List<ComboboxSelector> TeamSelectors
		{
			get { return _teamSelectors; }
			set { Set(() => TeamSelectors, ref _teamSelectors, value); }
		}

		public PlayerExtended SelectedPlayer
		{
			get { return _selectedPlayer; }
			set
			{
				Set(() => SelectedPlayer, ref _selectedPlayer, value);
				if (value == null) return;
				if (CurrentTeamSelector != null) CurrentTeamSelector = null;
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

		public bool IsGenerating
		{
			get { return _isGenerating; }
			set { Set(() => IsGenerating, ref _isGenerating, value); }
		}

		public bool HasGeneratedHeatmap
		{
			get { return _hasGeneratedHeatmap; }
			set { Set(() => HasGeneratedHeatmap, ref _hasGeneratedHeatmap, value); }
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

		public byte Opacity
		{
			get { return _opacity; }
			set
			{
				Set(() => Opacity, ref _opacity, value);
				ColorsLayer = _heatmapService.GenerateHeatmap(_points, value);
			}
		}

		#endregion

		#region Commands

		public RelayCommand GenerateCommand
		{
			get
			{
				return _generateCommand
					?? (_generateCommand = new RelayCommand(
					async () =>
					{
						IsGenerating = true;
						HasGeneratedHeatmap = false;

						try
						{
							// temp selection variables
							PlayerExtended player = SelectedPlayer;
							Round round = SelectedRound;

							// Analyze the demo to get HeatmapPoints
							CurrentDemo = await _demosService.AnalyzeHeatmapPoints(CurrentDemo);

							// Get back selection
							SelectedPlayer = player;
							SelectedRound = round;

							// Get the original overview image
							MapService mapService = MapService.Factory(CurrentDemo.MapName);
							OverviewLayer = mapService.GetWriteableImage();

							// Get HeatmapPoints based on selection
							_heatmapService = new HeatmapService(mapService, CurrentDemo, CurrentEventSelector, CurrentTeamSelector, SelectedPlayer, SelectedRound);
							_points = await _heatmapService.GetPoints();

							// Generate the colored layer
							ColorsLayer = _heatmapService.GenerateHeatmap(_points, _opacity);

							CommandManager.InvalidateRequerySuggested();
						}
						catch (Exception e)
						{
							if (!(e is MapException)) Logger.Instance.Log(e);
							if (e is MapException)
							{
								await _dialogService.ShowErrorAsync(e.Message, MessageDialogStyle.Affirmative).ConfigureAwait(false);
							}
						}

						IsGenerating = false;
						HasGeneratedHeatmap = true;

					}, () => !IsGenerating && (CurrentTeamSelector != null || SelectedPlayer != null) && (SelectAllRounds || SelectedRound != null)));
			}
		}

		/// <summary>
		/// Command to export heatmap as PNG
		/// </summary>
		public RelayCommand ExportCommand
		{
			get
			{
				return _exportCommand
					?? (_exportCommand = new RelayCommand(
					async () =>
					{
						try
						{
							Image overviewImage = _heatmapService.GenerateOverviewImage(OverviewLayer, ColorsLayer);
							SaveFileDialog saveHeatmapDialog = new SaveFileDialog
							{
								FileName = CurrentDemo.Name.Substring(0, CurrentDemo.Name.Length - 4) + ".png",
								Filter = "PNG file (*.png)|*.png"
							};

							if (saveHeatmapDialog.ShowDialog() == DialogResult.OK)
							{
								overviewImage.Save(saveHeatmapDialog.FileName, ImageFormat.Png);
							}
						}
						catch (Exception e)
						{
							Logger.Instance.Log(e);
							await _dialogService.ShowErrorAsync("An error occured while exporting heatmap to PNG.", MessageDialogStyle.Affirmative).ConfigureAwait(false);
						}

					}, () => HasGeneratedHeatmap && !IsGenerating));
			}
		}

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

		#endregion

		public HeatmapViewModel(DialogService dialogService, IDemosService demosService)
		{
			_dialogService = dialogService;
			_demosService = demosService;
			EventSelectors.Add(new ComboboxSelector("kills", "Kills"));
			EventSelectors.Add(new ComboboxSelector("shots", "Shots fired"));
			EventSelectors.Add(new ComboboxSelector("flashbangs", "Flashbangs"));
			EventSelectors.Add(new ComboboxSelector("he", "HE Grenades"));
			EventSelectors.Add(new ComboboxSelector("smokes", "Smokes"));
			EventSelectors.Add(new ComboboxSelector("molotovs", "Molotovs"));
			EventSelectors.Add(new ComboboxSelector("decoys", "Decoy"));
			CurrentEventSelector = EventSelectors[0];

			TeamSelectors.Add(new ComboboxSelector("CT", "Counter-Terrorists"));
			TeamSelectors.Add(new ComboboxSelector("T", "Terrorists"));
			TeamSelectors.Add(new ComboboxSelector("BOTH", "Both"));
			CurrentTeamSelector = TeamSelectors[2];
		}

		public override void Cleanup()
		{
			base.Cleanup();
			HasGeneratedHeatmap = false;
			IsGenerating = false;
			OverviewLayer = null;
			ColorsLayer = null;
			SelectedPlayer = null;
			SelectedRound = null;
		}
	}
}
