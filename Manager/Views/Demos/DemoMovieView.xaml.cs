using System.Windows.Controls;
using System.Windows.Input;

namespace Manager.Views.Demos
{
	public partial class DemoMovieView : UserControl
	{
		public DemoMovieView()
		{
			InitializeComponent();
			Focusable = true;
			Loaded += (s, e) => Keyboard.Focus(this);
		}
	}
}
