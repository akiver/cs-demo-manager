using CefSharp.Wpf;
using CSGO_Demos_Manager.Exceptions.Heatmap;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Services;
using CSGO_Demos_Manager.Services.Heatmap;
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

		private List<HeatmapSelector> _heatmapSelectors = new List<HeatmapSelector>();

		private HeatmapSelector _currentHeatmapSelector;

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

		public List<HeatmapSelector> HeatmapSelectors
		{
			get { return _heatmapSelectors; }
			set { Set(() => HeatmapSelectors, ref _heatmapSelectors, value); }
		}

		public HeatmapSelector CurrentHeatmapSelector
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
							HeamapService = HeatmapService.Factory(CurrentDemo.MapName);
							string html = await HeamapService.GenerateHtml(CurrentDemo, CurrentHeatmapSelector);
							HeatmapBrowser.LoadHtml(html, "http://render/html");
						}
						catch (HeatmapException e)
						{
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

							Image image = HeamapService.GenerateImage((string)response.Result);

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
			HeatmapSelectors.Add(new HeatmapSelector("kills", "Kills"));
			HeatmapSelectors.Add(new HeatmapSelector("shots", "Shots fired"));
			HeatmapSelectors.Add(new HeatmapSelector("flashbangs", "Flashbangs"));
			HeatmapSelectors.Add(new HeatmapSelector("he", "HE Grenades"));
			HeatmapSelectors.Add(new HeatmapSelector("smokes", "Smokes"));
			HeatmapSelectors.Add(new HeatmapSelector("molotovs", "Molotovs"));
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
				Console.WriteLine(e.Message);
			}
		}
	}
}
