using DemoInfo.DT;
using DemoInfo.Messages;
using ProtoBuf;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DemoInfo.DP.Handler
{
    class PacketEntitesHandler : IMessageParser
    {
        public bool CanHandleMessage(IExtensible message)
        {
            return message.GetType() == typeof(Messages.CSVCMsg_PacketEntities);
        }

        public void ApplyMessage(ProtoBuf.IExtensible message, DemoParser parser)
        {
            CSVCMsg_PacketEntities packetEntites = (CSVCMsg_PacketEntities)message;

			using (IBitStream reader = BitStreamUtil.Create(packetEntites.entity_data)) {
				int currentEntity = -1;
				for (int i = 0; i < packetEntites.updated_entries; i++) {
					currentEntity += 1 + (int)reader.ReadUBitInt();

					// Leave flag
					if (!reader.ReadBit()) {
						// enter flag
						if (reader.ReadBit()) {
							var e = ReadEnterPVS(reader, currentEntity, parser);
							e.ApplyUpdate(reader);
						} else {
							// preserve
							Entity e = parser.entites[currentEntity];
							//Console.ForegroundColor = ConsoleColor.Green;
							//Console.WriteLine("Entity #" + e.ID + ": " + e.ServerClass.Name);
							//Console.ResetColor();
							e.ApplyUpdate(reader);
						}
					} else {
						// leave
						if (reader.ReadBit()) {
							parser.entites.Remove(currentEntity);
							if (parser.Players.ContainsKey(currentEntity))
								parser.Players.Remove(currentEntity);
						}
					}
				}
			}
        }

        public Entity ReadEnterPVS(IBitStream reader, int id, DemoParser parser)
        {
            int serverClassID = (int)reader.ReadInt(parser.DataTables.ClassBits);

            ServerClass entityClass = parser.DataTables.ServerClasses[serverClassID];

            reader.ReadInt(10); //Entity serial. 

            Entity newEntity = new Entity(id, entityClass);
            //Console.ForegroundColor = ConsoleColor.Red;
            //Console.WriteLine("Entity #"+id+": " + entityClass.Name);
            //Console.ResetColor();

            parser.entites[newEntity.ID] = newEntity;

            return newEntity;
        }


		public int Priority { get { return 0; } }
    }
}
