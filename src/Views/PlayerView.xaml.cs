using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace CSGO_Demos_Manager.Views
{
	public partial class PlayerView : UserControl
	{
		public PlayerView()
		{
			InitializeComponent();
			IsVisibleChanged += PlayerView_IsVisibleChanged;
		}

		private void PlayerView_IsVisibleChanged(object sender, DependencyPropertyChangedEventArgs e)
		{
			if (!(bool)e.NewValue) return;
			Focusable = true;
			Keyboard.Focus(this);
		}
	}
}
