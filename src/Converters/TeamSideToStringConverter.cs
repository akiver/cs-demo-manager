using System;
using System.Globalization;
using System.Windows.Data;
using DemoInfo;

namespace CSGO_Demos_Manager.Converters
{
	public class TeamSideToStringConverter : IValueConverter
	{
		public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
		{
			Team type = (Team)value;
			switch (type)
			{
				case Team.CounterTerrorist:
					return "CT";
				case Team.Terrorist:
					return "T";
				case Team.Spectate:
					return "SPEC";
			}
			return "Unknown";
		}

		public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
		{
			return value;
		}
	}
}
