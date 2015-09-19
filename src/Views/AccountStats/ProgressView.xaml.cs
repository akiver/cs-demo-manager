using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace CSGO_Demos_Manager.Views.AccountStats
{
	public partial class ProgressView : UserControl
	{
		public ProgressView()
		{
			InitializeComponent();
			IsVisibleChanged += ProgressView_IsVisibleChanged;
		}

		private void ProgressView_IsVisibleChanged(object sender, DependencyPropertyChangedEventArgs e)
		{
			if (!(bool)e.NewValue) return;
			Focusable = true;
			Keyboard.Focus(this);
		}
	}
}
