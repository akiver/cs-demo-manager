using System.Windows;

namespace CSGO_Demos_Manager.Converters
{
	public sealed class BooleanToVisibilityInvertedConverter : BooleanConverter<Visibility>
	{
		public BooleanToVisibilityInvertedConverter() :
				base(Visibility.Collapsed, Visibility.Visible)
		{
		}
	}
}