using ProtoBuf;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DemoInfo.DP
{
    interface IMessageParser
    {
        bool CanHandleMessage(IExtensible message);
        void ApplyMessage(IExtensible message, DemoParser parser);
        int GetPriority();
    }
}
 