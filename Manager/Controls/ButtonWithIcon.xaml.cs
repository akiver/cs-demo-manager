using System.Windows;
using System.Windows.Controls;
using MahApps.Metro.IconPacks;

namespace Manager.Controls
{
    public partial class ButtonWithIcon : Button
    {
        public static readonly DependencyProperty IconProperty =
            DependencyProperty.Register("Icon", typeof(PackIconMaterialKind), typeof(ButtonWithIcon), new UIPropertyMetadata(null));

        public static readonly DependencyProperty TextProperty =
            DependencyProperty.Register("Text", typeof(string), typeof(ButtonWithIcon), new UIPropertyMetadata(""));

        public PackIconMaterialKind Icon
        {
            get => (PackIconMaterialKind)GetValue(IconProperty);
            set => SetValue(IconProperty, value);
        }

        public string Text
        {
            get => (string)GetValue(TextProperty);
            set => SetValue(TextProperty, value);
        }

        public ButtonWithIcon()
        {
            InitializeComponent();
        }
    }
}
