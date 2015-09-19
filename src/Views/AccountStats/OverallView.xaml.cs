using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace CSGO_Demos_Manager.Views.AccountStats
{
	public partial class OverallView : UserControl
	{
		public OverallView()
		{
			InitializeComponent();
			IsVisibleChanged += OverallView_IsVisibleChanged;
		}

		private void OverallView_IsVisibleChanged(object sender, DependencyPropertyChangedEventArgs e)
		{
			if (!(bool)e.NewValue) return;
			Focusable = true;
			Keyboard.Focus(this);
		}
	}
}
