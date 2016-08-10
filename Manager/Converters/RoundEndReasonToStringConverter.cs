using System;
using System.Globalization;
using System.Windows.Data;
using Core;
using DemoInfo;

namespace Manager.Converters
{
	public class RoundEndReasonToStringConverter : IValueConverter
	{
		public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
		{
			RoundEndReason reason = (RoundEndReason)value;
			switch (reason)
			{
				case RoundEndReason.CTWin:
					return AppSettings.CT_WIN;
				case RoundEndReason.TerroristWin:
					return AppSettings.T_WIN;
				case RoundEndReason.TargetBombed:
					return AppSettings.BOMB_EXPLODED;
				case RoundEndReason.BombDefused:
					return AppSettings.BOMB_DEFUSED;
				case RoundEndReason.CTSurrender:
					return AppSettings.CT_SURRENDER;
				case RoundEndReason.TerroristsSurrender:
					return AppSettings.T_SURRENDER;
				case RoundEndReason.TargetSaved:
					return AppSettings.TARGET_SAVED;
				default:
					return AppSettings.UNKNOWN;
			}
		}

		public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
		{
			return value;
		}
	}
}
