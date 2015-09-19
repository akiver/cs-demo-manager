using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace CSGO_Demos_Manager.Views
{
	public partial class KillsView : UserControl
	{
		public KillsView()
		{
			InitializeComponent();
			IsVisibleChanged += KillsView_IsVisibleChanged;
		}

		private void KillsView_IsVisibleChanged(object sender, DependencyPropertyChangedEventArgs e)
		{
			if (!(bool)e.NewValue) return;
			Focusable = true;
			Keyboard.Focus(this);
		}
	}
}
