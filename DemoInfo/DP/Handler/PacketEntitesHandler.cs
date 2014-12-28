using DemoInfo.DT;
using DemoInfo.Messages;
using ProtoBuf;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;

namespace DemoInfo.DP.Handler
{
    class PacketEntitesHandler
    {
		public static void Apply(PacketEntities packetEntities, IBitStream reader, DemoParser parser)
        {
			int currentEntity = -1;
			for (int i = 0; i < packetEntities.UpdatedEntries; i++) {
				currentEntity += 1 + (int)reader.ReadUBitInt();

				// Leave flag
				if (!reader.ReadBit()) {
					// enter flag
					if (reader.ReadBit()) {
						var e = ReadEnterPVS(reader, currentEntity, parser);

						parser.Entities[currentEntity] = e;

						e.ApplyUpdate(reader);
					} else {
						// preserve
						Entity e = parser.Entities[currentEntity];
						e.ApplyUpdate(reader);
					}
				} else {
					// leave
					parser.Entities [currentEntity].Leave ();
					parser.Entities[currentEntity] = null;
					if (reader.ReadBit()) {
					}
				}
			}
        }

        public static Entity ReadEnterPVS(IBitStream reader, int id, DemoParser parser)
        {
            int serverClassID = (int)reader.ReadInt(parser.SendTableParser.ClassBits);

            ServerClass entityClass = parser.SendTableParser.ServerClasses[serverClassID];

            reader.ReadInt(10); //Entity serial. 

			Entity newEntity = new Entity(id, entityClass);

			newEntity.ServerClass.AnnounceNewEntity(newEntity);

			if (parser.instanceBaseline.ContainsKey(serverClassID)) {
				using (var ms = new MemoryStream(parser.instanceBaseline[serverClassID])) {
					ms.Position = 0;
					newEntity.ApplyUpdate(BitStreamUtil.Create(ms));
				}
			}

            return newEntity;
        }
    }
}
