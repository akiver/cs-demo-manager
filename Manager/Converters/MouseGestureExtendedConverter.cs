using System.ComponentModel;
using System.Windows.Input;
using Manager.Internals.Mouse;

namespace Manager.Converters
{
    public class MouseGestureExtendedConverter : MouseGestureConverter
    {
        public override object ConvertFrom(ITypeDescriptorContext context, System.Globalization.CultureInfo culture, object source)
        {
            switch (source.ToString())
            {
                case "XButton1":
                    return new MouseGestureExtended(MouseButton.XButton1);
                case "XButton2":
                    return new MouseGestureExtended(MouseButton.XButton2);
            }

            return base.ConvertFrom(context, culture, source);
        }
    }
}
