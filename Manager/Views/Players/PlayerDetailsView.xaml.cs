using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace Manager.Views.Players
{
	public partial class PlayerDetailsView : UserControl
	{
		public PlayerDetailsView()
		{
			InitializeComponent();
			IsVisibleChanged += DetailsView_IsVisibleChanged;
		}

		private void DetailsView_IsVisibleChanged(object sender, DependencyPropertyChangedEventArgs e)
		{
			if (!(bool)e.NewValue) return;
			Focusable = true;
			Keyboard.Focus(this);
		}
	}
}
