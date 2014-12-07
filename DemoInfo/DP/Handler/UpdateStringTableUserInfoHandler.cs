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
		public bool TryApplyMessage(ProtoBuf.IExtensible message, DemoParser parser)
		{
			var update = message as CSVCMsg_UpdateStringTable;
			if (( update == null ) || ( parser.stringTables[update.table_id].name != "userinfo" ))
				return false;

			CSVCMsg_CreateStringTable create = parser.stringTables[update.table_id];
			create.num_entries = update.num_changed_entries;
			create.string_data = update.string_data;

			CreateStringTableUserInfoHandler h = new CreateStringTableUserInfoHandler();
			h.ParseStringTableUpdate(create, parser);

			return true;
		}

		public int Priority { get { return 0; } }
	}
}
