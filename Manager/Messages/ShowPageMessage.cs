using System.Windows.Controls;

namespace Manager.Messages
{
    public class ShowPageMessage
    {
        public UserControl Page { get; }

        public ShowPageMessage(UserControl page)
        {
            Page = page;
        }
    }
}
