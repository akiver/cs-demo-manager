using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace CSGO_Demos_Manager.Views
{
	public partial class HeatmapView : UserControl
	{
		public HeatmapView()
		{
			InitializeComponent();
			IsVisibleChanged += HeatmapView_IsVisibleChanged;
		}

		private void HeatmapView_IsVisibleChanged(object sender, DependencyPropertyChangedEventArgs e)
		{
			if (!(bool)e.NewValue) return;
			Focusable = true;
			Keyboard.Focus(this);
		}
	}
}
