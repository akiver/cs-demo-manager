using System.Windows;

namespace CSGO_Demos_Manager.Converters
{
	/// <summary>
	/// Class to pass DataContext to children elements
	/// </summary>
	public class BindingProxy : Freezable
	{
		protected override Freezable CreateInstanceCore()
		{
			return new BindingProxy();
		}

		public object Data
		{
			get { return GetValue(DataProperty); }
			set { SetValue(DataProperty, value); }
		}

		public static readonly DependencyProperty DataProperty =
			DependencyProperty.Register("Data", typeof(object), typeof(BindingProxy), new UIPropertyMetadata(null));
	}
}