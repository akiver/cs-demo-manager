using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace CSGO_Demos_Manager.Views.AccountStats
{
	public partial class RankView : UserControl
	{
		public RankView()
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
