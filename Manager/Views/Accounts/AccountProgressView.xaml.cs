using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace Manager.Views.Accounts
{
	public partial class AccountProgressView : UserControl
	{
		public AccountProgressView()
		{
			InitializeComponent();
			IsVisibleChanged += ProgressView_IsVisibleChanged;
		}

		private void ProgressView_IsVisibleChanged(object sender, DependencyPropertyChangedEventArgs e)
		{
			if (!(bool)e.NewValue) return;
			Focusable = true;
			Keyboard.Focus(this);
		}
	}
}
