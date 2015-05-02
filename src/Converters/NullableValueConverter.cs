using System;
using System.Globalization;
using System.Windows.Data;

namespace CSGO_Demos_Manager.Converters
{
	class NullableValueConverter : IValueConverter
	{
		public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
		{
			return value;
		}

		public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
		{
			if (value == null || string.IsNullOrEmpty(value.ToString()))
				return null;

			return value;
		}
	}
}
