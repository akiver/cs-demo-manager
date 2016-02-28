using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace CSGO_Demos_Manager.Views
{
	public partial class DemoStuffsView : UserControl
	{
		public DemoStuffsView()
		{
			InitializeComponent();
			IsVisibleChanged += DemoStuffView_IsVisibleChanged;
		}

		private void DemoStuffView_IsVisibleChanged(object sender, DependencyPropertyChangedEventArgs e)
		{
			if (!(bool)e.NewValue) return;
			Focusable = true;
			Keyboard.Focus(this);
		}
	}
}
