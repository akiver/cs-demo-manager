using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace Manager.Views.Accounts
{
	public partial class AccountMapsView : UserControl
	{
		public AccountMapsView()
		{
			InitializeComponent();
			IsVisibleChanged += MapView_IsVisibleChanged;
		}

		private void MapView_IsVisibleChanged(object sender, DependencyPropertyChangedEventArgs e)
		{
			if (!(bool)e.NewValue) return;
			Focusable = true;
			Keyboard.Focus(this);
		}
	}
}
