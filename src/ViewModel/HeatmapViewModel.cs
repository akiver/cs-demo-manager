using System;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Services;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using MahApps.Metro.Controls.Dialogs;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Linq;
using System.Threading;
using System.Windows.Forms;
using System.Windows.Input;
using System.Windows.Media.Imaging;
using CSGO_Demos_Manager.Exceptions.Map;
using CSGO_Demos_Manager.Internals;
using CSGO_Demos_Manager.Internals.MultiSelect;
using CSGO_Demos_Manager.Services.Interfaces;
using CSGO_Demos_Manager.Services.Map;
using CSGO_Demos_Manager.Views;

namespace CSGO_Demos_Manager.ViewModel
{
	public class HeatmapViewModel : ViewModelBase
	{

		#region Properties

		private RelayCommand _windowLoadedCommand;

		private RelayCommand _generateCommand;

		private RelayCommand _exportCommand;

		private Demo _currentDemo;

		private WriteableBitmap _overviewLayer;

		private WriteableBitmap _colorsLayer;

		private List<HeatmapPoint> _points = new List<HeatmapPoint>();

		private readonly DialogService _dialogService;

		private HeatmapService _heatmapService;

		private List<ComboboxSelector> _eventSelectors = new List<ComboboxSelector>();

		private ComboboxSelector _currentEventSelector;

		private RelayCommand<Demo> _backToDemoDetailsCommand;

		private RelayCommand _clearSelectedPlayerCommand;

		private RelayCommand _clearSelectedRoundCommand;

		private RelayCommand _clearSelectedSideCommand;

		private RelayCommand _selectAllSideCommand;

		private RelayCommand _selectAllRoundCommand;

		private RelayCommand _selectAllPlayerCommand;

		private bool _isGenerating;

		private bool _hasGeneratedHeatmap;
		
		private readonly ICacheService _cacheService;

		private MapService _mapService;

		private byte _opacity = 150;

		private CancellationTokenSource _cts;

		private MultiSelectCollectionView<Round> _rounds;

		private MultiSelectCollectionView<PlayerExtended> _players;

		private MultiSelectCollectionView<ComboboxSelector> _sides;

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

		public byte Opacity
		{
			get { return _opacity; }
			set
			{
				Set(() => Opacity, ref _opacity, value);
				ColorsLayer = _heatmapService.GenerateHeatmap(_points, value);
			}
		}

		public MultiSelectCollectionView<Round> Rounds
		{
			get { return _rounds; }
			set { Set(() => Rounds, ref _rounds, value); }
		}

		public MultiSelectCollectionView<PlayerExtended> Players
		{
			get { return _players; }
			set { Set(() => Players, ref _players, value); }
		}

		public MultiSelectCollectionView<ComboboxSelector> Sides
		{
			get { return _sides; }
			set { Set(() => Sides, ref _sides, value); }
		}

		#endregion

		#region Commands

		public RelayCommand WindowLoaded
		{
			get
			{
				return _windowLoadedCommand
					?? (_windowLoadedCommand = new RelayCommand(
					async () =>
					{
						try
						{
							Sides = new MultiSelectCollectionView<ComboboxSelector>(new List<ComboboxSelector>
						{
							new ComboboxSelector("CT", "Counter-Terrorists"),
							new ComboboxSelector("T", "Terrorists")
						});
							Rounds = new MultiSelectCollectionView<Round>(CurrentDemo.Rounds);
							Players = new MultiSelectCollectionView<PlayerExtended>(CurrentDemo.Players);

							// Get the original overview image
							_mapService = MapService.Factory(CurrentDemo);
							OverviewLayer = _mapService.GetWriteableImage();
						}
						catch (Exception e)
						{
							await _dialogService.ShowErrorAsync(e.Message, MessageDialogStyle.Affirmative);
						}
					}));
			}
		}

		public RelayCommand ClearSelectedPlayerCommand
		{
			get
			{
				return _clearSelectedPlayerCommand
					?? (_clearSelectedPlayerCommand = new RelayCommand(
					() =>
					{
						Players.DeselectAll();
					}));
			}
		}

		public RelayCommand ClearSelectedRoundCommand
		{
			get
			{
				return _clearSelectedRoundCommand
					?? (_clearSelectedRoundCommand = new RelayCommand(
					() =>
					{
						Rounds.DeselectAll();
					}));
			}
		}

		public RelayCommand ClearSelectedSideCommand
		{
			get
			{
				return _clearSelectedSideCommand
					?? (_clearSelectedSideCommand = new RelayCommand(
					() =>
					{
						Sides.DeselectAll();
					}));
			}
		}

		public RelayCommand SelectAllSideCommand
		{
			get
			{
				return _selectAllSideCommand
					?? (_selectAllSideCommand = new RelayCommand(
					() =>
					{
						Sides.SelectAll();
					}));
			}
		}

		public RelayCommand SelectAllRoundCommand
		{
			get
			{
				return _selectAllRoundCommand
					?? (_selectAllRoundCommand = new RelayCommand(
					() =>
					{
						Rounds.SelectAll();
					}));
			}
		}

		public RelayCommand SelectAllPlayerCommand
		{
			get
			{
				return _selectAllPlayerCommand
					?? (_selectAllPlayerCommand = new RelayCommand(
					() =>
					{
						Players.SelectAll();
					}));
			}
		}

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
							if (_cts == null)
							{
								_cts = new CancellationTokenSource();
							}

							if (_currentEventSelector.Id == "shots" && !CurrentDemo.WeaponFired.Any())
							{
								CurrentDemo.WeaponFired = await _cacheService.GetDemoWeaponFiredAsync(CurrentDemo);
							}

							// Get KillHeatmapPoint list based on selection
							_heatmapService = new HeatmapService(_mapService, CurrentDemo, CurrentEventSelector, Sides.SelectedItems.ToList(),
								Players.SelectedItems.ToList(), Rounds.SelectedItems.ToList());
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

					}, () => !IsGenerating));
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

		public HeatmapViewModel(DialogService dialogService, ICacheService cacheService)
		{
			_dialogService = dialogService;
			_cacheService = cacheService;
			EventSelectors.Add(new ComboboxSelector("kills", "Kills"));
			EventSelectors.Add(new ComboboxSelector("deaths", "Deaths"));
			EventSelectors.Add(new ComboboxSelector("shots", "Shots fired"));
			EventSelectors.Add(new ComboboxSelector("flashbangs", "Flashbangs"));
			EventSelectors.Add(new ComboboxSelector("he", "HE Grenades"));
			EventSelectors.Add(new ComboboxSelector("smokes", "Smokes"));
			EventSelectors.Add(new ComboboxSelector("molotovs", "Molotovs"));
			EventSelectors.Add(new ComboboxSelector("decoys", "Decoy"));
			CurrentEventSelector = EventSelectors[0];

			if (IsInDesignMode)
			{
				OverviewLayer = BitmapFactory.New(1024, 1024).FromResource("Resources/images/maps/overview/de_dust2.png");
			}
		}

		public override void Cleanup()
		{
			base.Cleanup();
			HasGeneratedHeatmap = false;
			IsGenerating = false;
			OverviewLayer = null;
			ColorsLayer = null;
		}
	}
}
