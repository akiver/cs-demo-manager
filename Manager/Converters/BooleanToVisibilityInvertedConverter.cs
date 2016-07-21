using System.Windows;

namespace Manager.Converters
{
	public sealed class BooleanToVisibilityInvertedConverter : BooleanConverter<Visibility>
	{
		public BooleanToVisibilityInvertedConverter() :
				base(Visibility.Collapsed, Visibility.Visible)
		{
		}
	}
}