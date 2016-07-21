using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace Manager.Views.Accounts
{
	public partial class AccountOverallView : UserControl
	{
		public AccountOverallView()
		{
			InitializeComponent();
			IsVisibleChanged += OverallView_IsVisibleChanged;
		}

		private void OverallView_IsVisibleChanged(object sender, DependencyPropertyChangedEventArgs e)
		{
			if (!(bool)e.NewValue) return;
			Focusable = true;
			Keyboard.Focus(this);
		}
	}
}
