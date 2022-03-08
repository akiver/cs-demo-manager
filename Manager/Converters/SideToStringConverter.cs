using System;
using System.Globalization;
using System.Windows.Data;
using Core.Models;

namespace Manager.Converters
{
    public class SideToStringConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            Side side = (Side)value;
            switch (side)
            {
                case Side.CounterTerrorist:
                    return Properties.Resources.CT;
                case Side.Terrorist:
                    return Properties.Resources.T;
                case Side.Spectate:
                    return Properties.Resources.Spec;
                default:
                    return string.Empty;
            }
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return value;
        }
    }
}
