using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace CSGO_Demos_Manager.Views.AccountStats
{
	public partial class WeaponView : UserControl
	{
		public WeaponView()
		{
			InitializeComponent();
			IsVisibleChanged += WeaponView_IsVisibleChanged;
		}

		private void WeaponView_IsVisibleChanged(object sender, DependencyPropertyChangedEventArgs e)
		{
			if (!(bool)e.NewValue) return;
			Focusable = true;
			Keyboard.Focus(this);
		}
	}
}
