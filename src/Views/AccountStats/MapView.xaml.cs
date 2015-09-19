using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace CSGO_Demos_Manager.Views.AccountStats
{
	public partial class MapView : UserControl
	{
		public MapView()
		{
			InitializeComponent();
			IsVisibleChanged += MapView_IsVisibleChanged;
		}

		private void MapView_IsVisibleChanged(object sender, DependencyPropertyChangedEventArgs e)
		{
			if (!(bool)e.NewValue) return;
			Focusable = true;
			Keyboard.Focus(this);
		}
	}
}
