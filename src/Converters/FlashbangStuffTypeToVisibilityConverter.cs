using System;
using System.Globalization;
using System.Windows;
using System.Windows.Data;

namespace CSGO_Demos_Manager.Converters
{
	public class FlashbangStuffTypeToVisibilityConverter : IValueConverter
	{
		public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
		{
			string type = value as string;
			if (type == "flashbangs") return Visibility.Visible;
			return Visibility.Collapsed;
		}

		public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
		{
			return value;
		}
	}
}
