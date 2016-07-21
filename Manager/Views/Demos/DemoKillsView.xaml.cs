using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace Manager.Views.Demos
{
	public partial class DemoKillsView : UserControl
	{
		public DemoKillsView()
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
