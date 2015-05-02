using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using CefSharp;

namespace CSGO_Demos_Manager.Views
{
	public partial class HeatmapView : UserControl
	{
		public HeatmapView()
		{
			if (!Cef.IsInitialized)
			{
				var settings = new CefSettings
				{
					PackLoadingDisabled = false,
					CachePath = AppSettings.GetFolderCachePath()
				};

				if (!Cef.Initialize(settings))
				{
					throw new Exception("Error init CefSharp");
				}
			}

			InitializeComponent();
			IsVisibleChanged += HomeView_IsVisibleChanged;
		}

		private void HomeView_IsVisibleChanged(object sender, DependencyPropertyChangedEventArgs e)
		{
			if (!(bool)e.NewValue) return;
			Focusable = true;
			Keyboard.Focus(this);
		}
	}
}
