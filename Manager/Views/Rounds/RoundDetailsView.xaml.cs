using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace Manager.Views.Rounds
{
	public partial class RoundDetailsView : UserControl
	{
		public RoundDetailsView()
		{
			InitializeComponent();
			IsVisibleChanged += RoundView_IsVisibleChanged;
		}

		private void RoundView_IsVisibleChanged(object sender, DependencyPropertyChangedEventArgs e)
		{
			if (!(bool)e.NewValue) return;
			Focusable = true;
			Keyboard.Focus(this);
		}
	}
}
