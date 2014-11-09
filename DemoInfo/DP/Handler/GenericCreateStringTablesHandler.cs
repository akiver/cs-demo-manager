using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DemoInfo.DP.Handler
{
    class GenericCreateStringTablesHandler : IMessageParser
    {
        public bool CanHandleMessage(ProtoBuf.IExtensible message)
        {
            return message is Messages.CSVCMsg_CreateStringTable;
        }

        public void ApplyMessage(ProtoBuf.IExtensible message, DemoParser parser)
        {
            parser.stringTables.Add((Messages.CSVCMsg_CreateStringTable)message);
        }

		public int Priority { get { return 0; } }
    }
}
