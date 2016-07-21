using System.Windows;

namespace Manager.Converters
{
	public sealed class BooleanToVisibilityConverter : BooleanConverter<Visibility>
	{
		public BooleanToVisibilityConverter() :
				base(Visibility.Visible, Visibility.Collapsed)
		{
		}
	}
}
