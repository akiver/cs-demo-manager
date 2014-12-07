using DemoInfo.DP.Handler;
using DemoInfo.DT;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DemoInfo.DP
{
	internal class Entity
	{
		public int ID { get; set; }

		public ServerClass ServerClass { get; set; }

		public Dictionary<string, object> Properties { get; private set; }

		public Entity(int id, ServerClass serverClass)
		{
			Properties = new Dictionary<string,object>();
			this.ID = id;
			this.ServerClass = serverClass;
		}

		public void ApplyUpdate(IBitStream reader)
		{
			bool newWay = reader.ReadBit();
			int index = -1;
			var entries = new List<FlattenedPropEntry>();
			while ((index = ReadFieldIndex(reader, index, newWay)) != -1)
				entries.Add(ServerClass.flattenedProps[index]);

			foreach (var prop in entries)
				Properties[prop.PropertyName] = PropDecoder.DecodeProp(prop, reader);
		}

		int ReadFieldIndex(IBitStream reader, int lastIndex, bool bNewWay)
		{
			if (bNewWay) {
				if (reader.ReadBit()) {
					return lastIndex + 1;
				}
			}

			int ret = 0;
			if (bNewWay && reader.ReadBit()) {
				ret = (int)reader.ReadInt(3);  // read 3 bits
			} else {
				ret = (int)reader.ReadInt(7); // read 7 bits
				switch (ret & ( 32 | 64 )) {
				case 32:
					ret = ( ret & ~96 ) | ( (int)reader.ReadInt(2) << 5 );
					break;
				case 64:
					ret = ( ret & ~96 ) | ( (int)reader.ReadInt(4) << 5 );
					break;
				case 96:
					ret = ( ret & ~96 ) | ( (int)reader.ReadInt(7) << 5 );
					break;
				}
			}

			if (ret == 0xFFF) { // end marker is 4095 for cs:go
				return -1;
			}

			return lastIndex + 1 + ret;
		}

		public override string ToString()
		{
			return ID + ": " + this.ServerClass;
		}
	}
}
