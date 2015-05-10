using MahApps.Metro.Controls;
using System.Windows.Input;
using System.Text.RegularExpressions;
using CSGO_Demos_Manager.ViewModel;

namespace CSGO_Demos_Manager
{
	public partial class MainWindow : MetroWindow
	{
		public MainWindow()
		{
			InitializeComponent();
			Closing += (s, e) => ViewModelLocator.Cleanup();
		}

		private void NumberPreviewTextInput(object sender, TextCompositionEventArgs e)
		{
			Regex regex = new Regex("[^0-9]+");
			e.Handled = regex.IsMatch(e.Text);
		}
	}
}
