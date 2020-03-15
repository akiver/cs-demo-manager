using System;
using System.Globalization;
using System.Windows.Data;

namespace Manager.Converters
{
	public class SteamAccountStatusToStringConverter : IValueConverter
	{
		public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
		{
			int statusCode = (int)value;
			switch (statusCode)
			{
				case 0:
					return Properties.Resources.Offline;
				case 1:
					return Properties.Resources.Online;
				case 2:
					return Properties.Resources.Busy;
				case 3:
					return Properties.Resources.Away;
				case 4:
					return Properties.Resources.Snooze;
				case 5:
					return Properties.Resources.LookingToTrade;
				case 6:
					return Properties.Resources.LookingToPlay;
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
