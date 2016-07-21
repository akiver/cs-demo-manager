using Core.Models;
using GalaSoft.MvvmLight.Command;

namespace Manager.Converters
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
