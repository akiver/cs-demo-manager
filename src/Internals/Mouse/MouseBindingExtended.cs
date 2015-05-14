using System.ComponentModel;
using System.Windows.Input;
using System.Windows.Markup;
using CSGO_Demos_Manager.Converters;

namespace CSGO_Demos_Manager.Internals.Mouse
{
	public class MouseBindingExtended : MouseBinding
	{
		[ValueSerializer(typeof(MouseGestureValueSerializer)), TypeConverter(typeof(MouseGestureExtendedConverter))]
		public override InputGesture Gesture
		{
			get { return base.Gesture; }
			set { base.Gesture = value; }
		}
	}
}