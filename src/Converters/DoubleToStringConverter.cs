using System;
using System.Globalization;
using System.Windows.Data;

namespace CSGO_Demos_Manager.Converters
{
	public class DoubleToStringConverter : IValueConverter
	{
		public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
		{
			double number = value as double? ?? 0;
			return number.ToString(CultureInfo.InvariantCulture);
		}

		public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
		{
			return value;
		}
	}
}