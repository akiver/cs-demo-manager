using CSGO_Demos_Manager.Models;
using GalaSoft.MvvmLight.Command;

namespace CSGO_Demos_Manager.Converters
{
	public class RowDemoDoubleClickedToDemoDetailsConverter : IEventArgsConverter
	{
		public object Convert(object value, object parameter)
		{
			Demo demo = (Demo)parameter;
			return demo;
		}
	}
}
