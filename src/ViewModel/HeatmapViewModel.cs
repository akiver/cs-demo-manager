using System;
using CSGO_Demos_Manager.Exceptions.Heatmap;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Services;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using MahApps.Metro.Controls.Dialogs;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Windows.Forms;
using System.Windows.Media.Imaging;
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

		private readonly DialogService _dialogService;

		private HeatmapService _heatmapService;

		private List<ComboboxSelector> _heatmapSelectors = new List<ComboboxSelector>();

		private ComboboxSelector _currentHeatmapSelector;

		private RelayCommand<Demo> _backToDemoDetailsCommand;

		private bool _isGenerating;

		private bool _hasGeneratedHeatmap;

		private readonly IDemosService _demosService;

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

		public List<ComboboxSelector> HeatmapSelectors
		{
			get { return _heatmapSelectors; }
			set { Set(() => HeatmapSelectors, ref _heatmapSelectors, value); }
		}

		public ComboboxSelector CurrentHeatmapSelector
		{
			get { return _currentHeatmapSelector; }
			set { Set(() => CurrentHeatmapSelector, ref _currentHeatmapSelector, value); }
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
							// Analyze the demo to get HeatmapPoints
							CurrentDemo = await _demosService.AnalyzeHeatmapPoints(CurrentDemo);

							// Get the original overview image
							MapService mapService = MapService.Factory(CurrentDemo.MapName);
							OverviewLayer = mapService.GetWriteableImage();

							// Get HeatmapPoints based on selection
							// TODO more selection
							_heatmapService = new HeatmapService(mapService);
							List<HeatmapPoint> points = await _heatmapService.GetPoints(CurrentDemo, CurrentHeatmapSelector);

							// Generate the colored layer
							// TODO variable opacity
							ColorsLayer = _heatmapService.GenerateHeatmap(points);
						}
						catch (Exception e)
						{
							Logger.Instance.Log(e);
							if (e is HeatmapException)
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
						},
						demo => CurrentDemo != null));
			}
		}

		#endregion

		public HeatmapViewModel(DialogService dialogService, IDemosService demosService)
		{
			_dialogService = dialogService;
			_demosService = demosService;
			HeatmapSelectors.Add(new ComboboxSelector("kills", "Kills"));
			HeatmapSelectors.Add(new ComboboxSelector("shots", "Shots fired"));
			HeatmapSelectors.Add(new ComboboxSelector("flashbangs", "Flashbangs"));
			HeatmapSelectors.Add(new ComboboxSelector("he", "HE Grenades"));
			HeatmapSelectors.Add(new ComboboxSelector("smokes", "Smokes"));
			HeatmapSelectors.Add(new ComboboxSelector("molotovs", "Molotovs"));
			CurrentHeatmapSelector = HeatmapSelectors[0];
		}
	}
}
