using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace CSGO_Demos_Manager.Views
{
	public partial class RoundView : UserControl
	{
		public RoundView()
		{
			InitializeComponent();
			IsVisibleChanged += RoundView_IsVisibleChanged;
		}

		private void RoundView_IsVisibleChanged(object sender, DependencyPropertyChangedEventArgs e)
		{
			if (!(bool)e.NewValue) return;
			Focusable = true;
			Keyboard.Focus(this);
		}
	}
}
