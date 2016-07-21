using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace Manager.Views.Demos
{
	public partial class DemoDamagesView : UserControl
	{
		public DemoDamagesView()
		{
			InitializeComponent();
			IsVisibleChanged += DemoDamagesView_IsVisibleChanged;
		}

		private void DemoDamagesView_IsVisibleChanged(object sender, DependencyPropertyChangedEventArgs e)
		{
			if (!(bool)e.NewValue) return;
			Focusable = true;
			Keyboard.Focus(this);
		}
	}
}
