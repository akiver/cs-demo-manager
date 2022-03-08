using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace Manager.Views.Demos
{
    public partial class DemoHeatmapView : UserControl
    {
        public DemoHeatmapView()
        {
            InitializeComponent();
            IsVisibleChanged += HeatmapView_IsVisibleChanged;
        }

        private void HeatmapView_IsVisibleChanged(object sender, DependencyPropertyChangedEventArgs e)
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
