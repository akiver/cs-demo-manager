using System.Collections.Generic;

namespace Manager.Messages
{
    public class ComboBoxMultiClosedMessage
    {
        public Dictionary<string, object> SelectedItems { get; set; }
    }
}
