using System;
using System.Globalization;
using System.Windows.Data;
using Core;

namespace Manager.Converters
{
	public class RankToImageConverter : IValueConverter
	{
		public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
		{
			if (value == null) return null;

			double rankNumber = 0;
			if (value is string)
			{
				rankNumber = double.Parse((string)value);
			}
			else
			{
				rankNumber = System.Convert.ToDouble(value);
			}

			if (rankNumber >= 1 && rankNumber < 2) return new Uri(AppSettings.CORE_URI + "Resources/Images/Ranks/elo01.png", UriKind.RelativeOrAbsolute);
			if (rankNumber >= 2 && rankNumber < 3) return new Uri(AppSettings.CORE_URI + "Resources/Images/Ranks/elo02.png", UriKind.RelativeOrAbsolute);
			if (rankNumber >= 3 && rankNumber < 4) return new Uri(AppSettings.CORE_URI + "Resources/Images/Ranks/elo03.png", UriKind.RelativeOrAbsolute);
			if (rankNumber >= 4 && rankNumber < 5) return new Uri(AppSettings.CORE_URI + "Resources/Images/Ranks/elo04.png", UriKind.RelativeOrAbsolute);
			if (rankNumber >= 5 && rankNumber < 6) return new Uri(AppSettings.CORE_URI + "Resources/Images/Ranks/elo05.png", UriKind.RelativeOrAbsolute);
			if (rankNumber >= 6 && rankNumber < 7) return new Uri(AppSettings.CORE_URI + "Resources/Images/Ranks/elo06.png", UriKind.RelativeOrAbsolute);
			if (rankNumber >= 7 && rankNumber < 8) return new Uri(AppSettings.CORE_URI + "Resources/Images/Ranks/elo07.png", UriKind.RelativeOrAbsolute);
			if (rankNumber >= 8 && rankNumber < 9) return new Uri(AppSettings.CORE_URI + "Resources/Images/Ranks/elo08.png", UriKind.RelativeOrAbsolute);
			if (rankNumber >= 9 && rankNumber < 10) return new Uri(AppSettings.CORE_URI + "Resources/Images/Ranks/elo09.png", UriKind.RelativeOrAbsolute);
			if (rankNumber >= 10 && rankNumber < 11) return new Uri(AppSettings.CORE_URI + "Resources/Images/Ranks/elo10.png", UriKind.RelativeOrAbsolute);
			if (rankNumber >= 11 && rankNumber < 12) return new Uri(AppSettings.CORE_URI + "Resources/Images/Ranks/elo11.png", UriKind.RelativeOrAbsolute);
			if (rankNumber >= 12 && rankNumber < 13) return new Uri(AppSettings.CORE_URI + "Resources/Images/Ranks/elo12.png", UriKind.RelativeOrAbsolute);
			if (rankNumber >= 13 && rankNumber < 14) return new Uri(AppSettings.CORE_URI + "Resources/Images/Ranks/elo13.png", UriKind.RelativeOrAbsolute);
			if (rankNumber >= 14 && rankNumber < 15) return new Uri(AppSettings.CORE_URI + "Resources/Images/Ranks/elo14.png", UriKind.RelativeOrAbsolute);
			if (rankNumber >= 15 && rankNumber < 16) return new Uri(AppSettings.CORE_URI + "Resources/Images/Ranks/elo15.png", UriKind.RelativeOrAbsolute);
			if (rankNumber >= 16 && rankNumber < 17) return new Uri(AppSettings.CORE_URI + "Resources/Images/Ranks/elo16.png", UriKind.RelativeOrAbsolute);
			if (rankNumber >= 17 && rankNumber < 18) return new Uri(AppSettings.CORE_URI + "Resources/Images/Ranks/elo17.png", UriKind.RelativeOrAbsolute);
			if (rankNumber >= 18) return new Uri(AppSettings.CORE_URI + "Resources/Images/Ranks/elo18.png", UriKind.RelativeOrAbsolute);
			return new Uri(AppSettings.CORE_URI + "Resources/Images/Ranks/no_rank.png", UriKind.RelativeOrAbsolute);
		}

		public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
		{
			return value;
		}
	}
}