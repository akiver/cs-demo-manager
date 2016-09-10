using System;
using System.Globalization;
using System.Windows.Data;
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
					return Properties.Resources.EndReasonCtWin;
				case RoundEndReason.TerroristWin:
					return Properties.Resources.EndReasonTwin;
				case RoundEndReason.TargetBombed:
					return Properties.Resources.EndReasonBombExploded;
				case RoundEndReason.BombDefused:
					return Properties.Resources.EndReasonBombDefused;
				case RoundEndReason.CTSurrender:
					return Properties.Resources.EndReasonCtSurrender;
				case RoundEndReason.TerroristsSurrender:
					return Properties.Resources.EndReasonTsurrender;
				case RoundEndReason.TargetSaved:
					return Properties.Resources.EndReasonTargetSaved;
				default:
					return Properties.Resources.EndReasonUnknown;
			}
		}

		public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
		{
			return value;
		}
	}
}
