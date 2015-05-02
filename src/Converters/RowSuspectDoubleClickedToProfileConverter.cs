using CSGO_Demos_Manager.Models;
using GalaSoft.MvvmLight.Command;

namespace CSGO_Demos_Manager.Converters
{
	public class RowSuspectDoubleClickedToProfileConverter : IEventArgsConverter
	{
		public object Convert(object value, object parameter)
		{
			Suspect suspect = (Suspect)parameter;
			return suspect;
		}
	}
}
