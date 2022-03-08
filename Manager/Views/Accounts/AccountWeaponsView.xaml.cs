using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace Manager.Views.Accounts
{
    public partial class AccountWeaponsView : UserControl
    {
        public AccountWeaponsView()
        {
            InitializeComponent();
            IsVisibleChanged += WeaponView_IsVisibleChanged;
        }

        private void WeaponView_IsVisibleChanged(object sender, DependencyPropertyChangedEventArgs e)
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
