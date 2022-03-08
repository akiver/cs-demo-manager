using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace Manager.Views.Demos
{
    public partial class DemoFlashbangsView : UserControl
    {
        public DemoFlashbangsView()
        {
            InitializeComponent();
            IsVisibleChanged += DemoFlashbangsView_IsVisibleChanged;
        }

        private void DemoFlashbangsView_IsVisibleChanged(object sender, DependencyPropertyChangedEventArgs e)
        {
            if (!(bool)e.NewValue)
            {
                return;
            }

            Focusable = true;
            Keyboard.Focus(this);
        }
    }
}
