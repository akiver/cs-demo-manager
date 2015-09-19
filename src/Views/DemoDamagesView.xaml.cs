using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace CSGO_Demos_Manager.Views
{
	public partial class DemoDamagesView : UserControl
	{
		public DemoDamagesView()
		{
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
