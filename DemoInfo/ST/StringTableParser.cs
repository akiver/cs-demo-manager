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
			using (IBitStream reader = BitStreamUtil.Create(stream)) {
				int numTables = reader.ReadByte();

				for (int i = 0; i < numTables; i++) {
					string tableName = reader.ReadString();

					ParseStringTable(reader, tableName == "userinfo", parser);
				}
			}
        }

		public void ParseStringTable(IBitStream reader, bool isUserInfo, DemoParser parser)
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
			        reader.ReadString(); // stringname

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
