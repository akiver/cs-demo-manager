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
                case RoundType.Normal:
                    return Properties.Resources.RoundTypeNormal;
                case RoundType.Eco:
                    return Properties.Resources.RoundTypeEco;
                case RoundType.ForceBuy:
                    return Properties.Resources.RoundTypeForceBuy;
                case RoundType.PistolRound:
                    return Properties.Resources.RoundTypePistolRound;
                case RoundType.SemiEco:
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
