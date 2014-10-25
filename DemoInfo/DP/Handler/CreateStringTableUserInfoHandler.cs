using DemoInfo.Messages;
using ProtoBuf;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DemoInfo.DP.Handler
{
    class CreateStringTableUserInfoHandler : IMessageParser
    {
        public bool CanHandleMessage(IExtensible message)
        {
            return message is CSVCMsg_CreateStringTable && ((CSVCMsg_CreateStringTable)message).name == "userinfo";
        }

        public void ApplyMessage(IExtensible message, DemoParser parser)
        {
            var create = (CSVCMsg_CreateStringTable)message;

            ParseStringTableUpdate(create, parser);
        }

        public void ParseStringTableUpdate(CSVCMsg_CreateStringTable table, DemoParser parser)
        {
			using (IBitStream reader = BitStreamUtil.Create(table.string_data)) {
				if (reader.ReadBit())
					throw new NotImplementedException("Encoded with dictionaries, unable to decode");

				int nTemp = table.max_entries;
				int nEntryBits = 0;
				while ((nTemp >>= 1) != 0)
					++nEntryBits;


				List<string> history = new List<string>();

				int lastEntry = -1;
	
				for (int i = 0; i < table.num_entries; i++) {
					int entryIndex = lastEntry + 1;
					// read in the entity-index
					if (!reader.ReadBit()) {
						entryIndex = (int)reader.ReadInt(nEntryBits);
					}

					lastEntry = entryIndex;

					// Read the name of the string into entry.
					string entry = "";
					if (entryIndex < 0 || entryIndex >= table.max_entries) {
						throw new InvalidDataException("bogus string index");
					}

					if (reader.ReadBit()) {
						bool substringcheck = reader.ReadBit();

						if (substringcheck) {
							int index = (int)reader.ReadInt(5);
							int bytestocopy = (int)reader.ReadInt(5);

							entry = history[index].Substring(0, bytestocopy);

							entry += reader.ReadString(1024);
						} else {
							entry = reader.ReadString(1024);
						}
					}

					if (entry == null)
						entry = "";

					// Read in the user data.
					byte[] userdata = new byte[0];
					if (reader.ReadBit()) {
						if (table.user_data_fixed_size) {
							userdata = reader.ReadBytes(table.user_data_size);
						} else {
							int bytesToRead = (int)reader.ReadInt(14);

							userdata = reader.ReadBytes(bytesToRead);
						}
					}

					if (userdata.Length == 0)
						break;

					// Now we'll parse the players out of it.
					BinaryReader playerReader = new BinaryReader(new MemoryStream(userdata));
					PlayerInfo info = PlayerInfo.ParseFrom(playerReader);

					if (entryIndex < parser.RawPlayers.Count)
						parser.RawPlayers[entryIndex] = info;
					else
						parser.RawPlayers.Add(info);
				}
			}
        }

        public int GetPriority()
        {
            return 0;
        }
    }
}
