using System.Windows;
using System.Windows.Controls;

namespace Manager.Controls
{
    public partial class LoadingMessage : UserControl
    {
        public static readonly DependencyProperty MessageProperty =
            DependencyProperty.Register("Message", typeof(string), typeof(LoadingMessage), new UIPropertyMetadata(""));

        public static readonly DependencyProperty VisibleProperty =
            DependencyProperty.Register("Visible", typeof(bool), typeof(LoadingMessage), new UIPropertyMetadata(true));

        public LoadingMessage()
        {
            InitializeComponent();
        }

        public string Message
        {
            get => (string)GetValue(MessageProperty);
            set => SetValue(MessageProperty, value);
        }

        public bool Visible
        {
            get => (bool)GetValue(VisibleProperty);
            set => SetValue(VisibleProperty, value);
        }
    }
}
