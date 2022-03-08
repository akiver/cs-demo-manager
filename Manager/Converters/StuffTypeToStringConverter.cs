using System;
using System.Globalization;
using System.Windows.Data;
using Core.Models;

namespace Manager.Converters
{
    public class StuffTypeToStringConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value != null)
            {
                StuffType type = (StuffType)value;
                switch (type)
                {
                    case StuffType.DECOY:
                        return Properties.Resources.Decoy;
                    case StuffType.FLASHBANG:
                        return Properties.Resources.Flashbang;
                    case StuffType.HE:
                        return Properties.Resources.HE;
                    case StuffType.INCENDIARY:
                        return Properties.Resources.Incendiary;
                    case StuffType.MOLOTOV:
                        return Properties.Resources.Molotov;
                    case StuffType.SMOKE:
                        return Properties.Resources.Smoke;
                    default:
                        return Properties.Resources.Unknown;
                }
            }

            return Properties.Resources.Unknown;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return value;
        }
    }
}
