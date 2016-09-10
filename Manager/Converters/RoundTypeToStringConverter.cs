using System;
using System.Globalization;
using System.Windows.Data;
using Core.Models;

namespace Manager.Converters
{
	public class RoundTypeToStringConverter : IValueConverter
	{
		public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
		{
			RoundType type = (RoundType)value;
			switch (type)
			{
				case RoundType.NORMAL:
					return Properties.Resources.RoundTypeNormal;
				case RoundType.ECO:
					return Properties.Resources.RoundTypeEco;
				case RoundType.FORCE_BUY:
					return Properties.Resources.RoundTypeForceBuy;
				case RoundType.PISTOL_ROUND:
					return Properties.Resources.RoundTypePistolRound;
				case RoundType.SEMI_ECO:
					return Properties.Resources.RoundTypeSemiEco;
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
