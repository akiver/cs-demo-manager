using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace Manager.Views.Suspects
{
	public partial class SuspectListView : UserControl
	{
		public SuspectListView()
		{
			InitializeComponent();
			IsVisibleChanged += SuspectsView_IsVisibleChanged;
		}

		private void SuspectsView_IsVisibleChanged(object sender, DependencyPropertyChangedEventArgs e)
		{
			if (!(bool)e.NewValue) return;
			Focusable = true;
			Keyboard.Focus(this);
		}
	}
}
