using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace Manager.Views.Demos
{
	public partial class DemoOverviewView : UserControl
	{
		public DemoOverviewView()
		{
			InitializeComponent();
			IsVisibleChanged += OverviewView_IsVisibleChanged;
		}

		private void OverviewView_IsVisibleChanged(object sender, DependencyPropertyChangedEventArgs e)
		{
			if (!(bool)e.NewValue) return;
			Focusable = true;
			Keyboard.Focus(this);
		}
	}
}
