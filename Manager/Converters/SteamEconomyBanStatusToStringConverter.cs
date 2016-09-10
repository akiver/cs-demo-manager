using System;
using System.Globalization;
using System.Windows.Data;

namespace Manager.Converters
{
	public class SteamEconomyBanStatusToStringConverter : IValueConverter
	{
		public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
		{
			string status = (string)value;
			switch (status)
			{
				case "none":
					return Properties.Resources.None;
				case "probation":
					return Properties.Resources.Probation;
				case "banned":
					return Properties.Resources.Banned;
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
