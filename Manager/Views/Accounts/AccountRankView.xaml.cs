using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace Manager.Views.Accounts
{
	public partial class AccountRankView : UserControl
	{
		public AccountRankView()
		{
			InitializeComponent();
			IsVisibleChanged += RankView_IsVisibleChanged;
		}

		private void RankView_IsVisibleChanged(object sender, DependencyPropertyChangedEventArgs e)
		{
			if (!(bool)e.NewValue) return;
			Focusable = true;
			Keyboard.Focus(this);
		}
	}
}
