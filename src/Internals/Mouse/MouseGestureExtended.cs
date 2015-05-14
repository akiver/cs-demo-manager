using System.Windows.Input;

namespace CSGO_Demos_Manager.Internals.Mouse
{
	public class MouseGestureExtended : MouseGesture
	{
		private readonly MouseButton _mouseButton;

		public MouseGestureExtended(MouseButton mouseButton)
		{
			_mouseButton = mouseButton;
		}

		public override bool Matches(object targetElement, InputEventArgs inputEventArgs)
		{
			var device = inputEventArgs.Device as MouseDevice;

			if (device != null)
			{
				switch (_mouseButton)
				{
					case MouseButton.XButton1:
						if (device.XButton1 == MouseButtonState.Pressed) return true;
						break;
					case MouseButton.XButton2:
						if (device.XButton2 == MouseButtonState.Pressed) return true;
						break;
				}
			}

			return false;
		}
	}
}