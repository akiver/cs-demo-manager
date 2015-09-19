using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace CSGO_Demos_Manager.Views
{
	public partial class DetailsView : UserControl
	{
		public DetailsView()
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
