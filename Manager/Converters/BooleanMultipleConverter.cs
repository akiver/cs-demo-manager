using System;
using System.Linq;
using System.Windows.Data;

namespace Manager.Converters
{
	public class BooleanMultipleConverter : IMultiValueConverter
	{
		public object Convert(object[] values, Type targetType, object parameter, System.Globalization.CultureInfo culture)
		{
			return values.Length > 0 && values.All(value => (bool)value);
		}
		public object[] ConvertBack(object value, Type[] targetTypes, object parameter, System.Globalization.CultureInfo culture)
		{
			return (object[])value;
		}
	}
}
