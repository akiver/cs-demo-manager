using System;
using System.Globalization;
using System.Windows.Data;
using Manager.Models;

namespace Manager.Converters
{
	public class StringToDemoStatusConverter : IValueConverter
	{
		public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
		{
			string status = value as string;
			foreach (DemoStatus st in DemoStatus.DefaultStatus)
			{
				if (st.Name == status) return st;
			}

			return DemoStatus.DefaultStatus[0];
		}

		public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
		{
			DemoStatus ds = value as DemoStatus;
			if (ds == null) return DemoStatus.NAME_DEMO_STATUS_NONE;
			return ds.Name;
		}
	}
}
