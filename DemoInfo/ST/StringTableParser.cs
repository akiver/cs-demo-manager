using demoinfosharp;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DemoInfo.ST
{
    class StringTableParser
    {
		public void ParsePacket(Stream stream, DemoParser parser)
        {
			// This is where the optimization ends.
			// Once it becomes a bottleneck, we can still reimplement a Stream version of BitArray.
			BitArrayStream reader;
			using (var memstream = new MemoryStream(checked((int)stream.Length))) {
				stream.CopyTo(memstream);
				reader = new BitArrayStream(memstream.GetBuffer());
			}

            int numTables = reader.ReadByte();

            for (int i = 0; i < numTables; i++)
            {
                string tableName = reader.ReadString();

				ParseStringTable(reader, tableName == "userinfo", parser);
            }
        }

		public void ParseStringTable(BitArrayStream reader, bool isUserInfo, DemoParser parser)
        {
			if (isUserInfo)
				parser.RawPlayers.Clear();

            int numStrings = (int)reader.ReadInt(16);


            for (int i = 0; i < numStrings; i++)
            {
                string stringName = reader.ReadString();

                if (stringName.Length >= 100)
                    throw new Exception("Roy said I should throw this.");

                if (reader.ReadBit())
                {
                    int userDataSize = (int)reader.ReadInt(16);

                    byte[] data = reader.ReadBytes(userDataSize);

                    if (isUserInfo && data.Length >= 340)
                    {
                        PlayerInfo info = PlayerInfo.ParseFrom(new BinaryReader(new MemoryStream(data)));

                        parser.RawPlayers.Add(info);
                    }
                }
            }

            // Client side stuff
	        if ( reader.ReadBit() )
	        {
		        int numstrings = (int)reader.ReadInt(16);
		        for ( int i = 0 ; i < numstrings; i++ )
		        {
			        string stringname = reader.ReadString();

			        if ( reader.ReadBit() )
			        {
				        int userDataSize = ( int )reader.ReadInt(16);

				        reader.ReadBytes( userDataSize );

			        }
			        else
			        {
			        }
		        }
	        }
        }
    }
}
