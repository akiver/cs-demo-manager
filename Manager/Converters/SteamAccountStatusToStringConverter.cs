using System;
using System.Globalization;
using System.Windows.Data;

namespace Manager.Converters
{
	public class SteamAccountStatusToStringConverter : IValueConverter
	{
		public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
		{
			if ((int)value == 0) return Properties.Resources.No;
			int statusCode = (int)value;
			switch (statusCode)
			{
				case 1:
					return Properties.Resources.Private;
				case 3:
					return Properties.Resources.Public;
				default:
					return Properties.Resources.Unknown;
			}
		}

		public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
		{
			return value;
		}
	}
}
