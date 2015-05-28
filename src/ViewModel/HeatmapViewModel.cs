using CefSharp.Wpf;
using CSGO_Demos_Manager.Exceptions.Heatmap;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Services;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using MahApps.Metro.Controls.Dialogs;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Windows.Input;
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

		private IWpfWebBrowser _heatmapBrowser;

		private object _evaluateJavaScriptResult;

		public ICommand EvaluateJavaScriptCommand { get; set; }

		private readonly DialogService _dialogService;

		private HeatmapService _heatmapService;

		private List<ComboboxSelector> _heatmapSelectors = new List<ComboboxSelector>();

		private ComboboxSelector _currentHeatmapSelector;

		private RelayCommand<Demo> _backToDemoDetailsCommand;

		private bool _isGenerating;

		private bool _hasGeneratedHeatmap;

		#endregion

		#region Accessors

		public Demo CurrentDemo
		{
			get { return _currentDemo; }
			set { Set(() => CurrentDemo, ref _currentDemo, value); }
		}

		public IWpfWebBrowser HeatmapBrowser
		{
			get { return _heatmapBrowser; }
			set { Set(() => HeatmapBrowser, ref _heatmapBrowser, value); }
		}

		public object EvaluateJavaScriptResult
		{
			get { return _evaluateJavaScriptResult; }
			set { Set(() => EvaluateJavaScriptResult, ref _evaluateJavaScriptResult, value); }
		}

		public HeatmapService HeamapService { get; set; }

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

						EvaluateJavaScriptCommand = new RelayCommand<string>(EvaluateJavaScript, s => !string.IsNullOrWhiteSpace(s));

						try
						{
							MapService mapService = MapService.Factory(CurrentDemo.MapName);
							_heatmapService = new HeatmapService(mapService);
							
							string html = await _heatmapService.Generate(CurrentDemo, CurrentHeatmapSelector);
							HeatmapBrowser.LoadHtml(html, "http://render/html");
						}
						catch (HeatmapException e)
						{
							Logger.Instance.Log(e);
							await _dialogService.ShowErrorAsync(e.Message, MessageDialogStyle.Affirmative).ConfigureAwait(false);
						}

						IsGenerating = false;
						HasGeneratedHeatmap = true;

					}, () => !IsGenerating));
			}
		}

		public RelayCommand ExportCommand
		{
			get
			{
				return _exportCommand
					?? (_exportCommand = new RelayCommand(
					() =>
					{
						var task = HeatmapBrowser.EvaluateScriptAsync("dataToPNG()");

						task.ContinueWith(t =>
						{
							if (t.IsFaulted) return;

							var response = t.Result;
							EvaluateJavaScriptResult = response.Success ? (response.Result ?? "null") : response.Message;

							Image image = _heatmapService.GenerateImage((string)response.Result);

							SaveFileDialog saveHeatmapDialog = new SaveFileDialog
							{
								FileName = CurrentDemo.Name.Substring(0, CurrentDemo.Name.Length - 4) + ".png",
								Filter = "PNG file (*.png)|*.png"
							};

							if (saveHeatmapDialog.ShowDialog() == DialogResult.OK)
							{
								image.Save(saveHeatmapDialog.FileName, ImageFormat.Png);
							}
						}, TaskScheduler.FromCurrentSynchronizationContext());

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

		public HeatmapViewModel(DialogService dialogService)
		{
			_dialogService = dialogService;
			HeatmapSelectors.Add(new ComboboxSelector("kills", "Kills"));
			HeatmapSelectors.Add(new ComboboxSelector("shots", "Shots fired"));
			HeatmapSelectors.Add(new ComboboxSelector("flashbangs", "Flashbangs"));
			HeatmapSelectors.Add(new ComboboxSelector("he", "HE Grenades"));
			HeatmapSelectors.Add(new ComboboxSelector("smokes", "Smokes"));
			HeatmapSelectors.Add(new ComboboxSelector("molotovs", "Molotovs"));
			CurrentHeatmapSelector = HeatmapSelectors[0];
		}

		private async void EvaluateJavaScript(string s)
		{
			try
			{
				var response = await HeatmapBrowser.EvaluateScriptAsync(s);

				EvaluateJavaScriptResult = response.Success ? (response.Result ?? "null") : response.Message;
			}
			catch (Exception e)
			{
				Logger.Instance.Log(e);
			}
		}
	}
}
