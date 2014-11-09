using DemoInfo.Messages;
using ProtoBuf;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DemoInfo.DP.Handler
{
    class UpdateStringTableUserInfoHandler : IMessageParser
    {
        public bool CanHandleMessage(IExtensible message)
        {
            return message is CSVCMsg_UpdateStringTable;
        }

        public void ApplyMessage(ProtoBuf.IExtensible message, DemoParser parser)
        {
            var update = (CSVCMsg_UpdateStringTable)message;

            if (parser.stringTables[update.table_id].name != "userinfo")
                return;

            CSVCMsg_CreateStringTable create = parser.stringTables[update.table_id];
            create.num_entries = update.num_changed_entries;
            create.string_data = update.string_data;

            CreateStringTableUserInfoHandler h = new CreateStringTableUserInfoHandler();
            h.ParseStringTableUpdate(create, parser);
        }

		public int Priority { get { return 0; } }
    }
}
