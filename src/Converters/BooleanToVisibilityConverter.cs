using System.Windows;

namespace CSGO_Demos_Manager.Converters
{
	public sealed class BooleanToVisibilityConverter : BooleanConverter<Visibility>
	{
		public BooleanToVisibilityConverter() :
				base(Visibility.Visible, Visibility.Collapsed)
		{
		}
	}
}
