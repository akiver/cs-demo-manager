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
		public void ParsePacket(IBitStream reader, DemoParser parser)
        {
			int numTables = reader.ReadByte();

			for (int i = 0; i < numTables; i++) {
				string tableName = reader.ReadString();

				ParseStringTable(reader, tableName, parser);
			}
        }

		public void ParseStringTable(IBitStream reader, string tableName, DemoParser parser)
		{
            int numStrings = (int)reader.ReadInt(16);

			if (tableName == "modelprecache") {
				parser.modelprecache.Clear ();
			}

            for (int i = 0; i < numStrings; i++)
            {
                string stringName = reader.ReadString();

                if (stringName.Length >= 100)
                    throw new Exception("Roy said I should throw this.");

                if (reader.ReadBit())
                {
                    int userDataSize = (int)reader.ReadInt(16);

                    byte[] data = reader.ReadBytes(userDataSize);

					if (tableName == "userinfo") {
						PlayerInfo info = PlayerInfo.ParseFrom(new BinaryReader(new MemoryStream(data)));

						parser.RawPlayers[int.Parse(stringName)] = info;
					} else if (tableName == "instancebaseline") {
						int classid = int.Parse(stringName); //wtf volvo?

						parser.instanceBaseline[classid] = data; 
					} else if (tableName == "modelprecache") {
						parser.modelprecache.Add (stringName);
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
