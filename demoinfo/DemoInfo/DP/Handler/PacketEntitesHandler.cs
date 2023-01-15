using DemoInfo.DT;
using System;
using System.Collections.Generic;

namespace DemoInfo.DP.Handler
{
    public static class PacketEntitesHandler
    {
        /// <summary>
        /// Decodes the bytes in the packet-entities message. 
        /// </summary>
        /// <param name="packetEntities">Packet entities.</param>
        /// <param name="reader">Reader.</param>
        /// <param name="parser">Parser.</param>
        public static void Apply(PacketEntities packetEntities, IBitStream reader, DemoParser parser)
        {
            int entityIndex = -1;

            for (var i = 0; i < packetEntities.UpdatedEntries; i++)
            {
                entityIndex += 1 + (int)reader.ReadUBitInt();

                if (reader.ReadBit())
                {
                    // FHDR_LEAVEPVS => LeavePVS
                    if (reader.ReadBit())
                    {
                        // FHDR_LEAVEPVS | FHDR_DELETE => LeavePVS with force delete. Should never happen on full update
                        var e = parser.Entities[entityIndex];
                        if (e != null)
                        {
                            e.ServerClass.AnnounceDestroyedEntity(e);
                            e.Leave();
                            parser.Entities[entityIndex] = null;
                        }
                    }
                }
                else if (reader.ReadBit())
                {
                    // FHDR_ENTERPVS => EnterPVS
                    var newEntity = ReadEnterPVS(reader, entityIndex, parser);
                    parser.Entities[entityIndex] = newEntity;
                }
                else
                {
                    // Delta update
                    var e = parser.Entities[entityIndex];
                    if (e != null)
                    {
                        e.ApplyUpdate(reader);
                    }
                    else
                    {
                        throw new Exception("Entity with index " + entityIndex + " doesn't exist but got an update");
                    }
                }
            }
        }

        /// <summary>
        /// Reads an update that occurs when a new edict enters the PVS (potentially visible system)
        /// </summary>
        /// <returns>The new Entity.</returns>
        private static Entity ReadEnterPVS(IBitStream reader, int entityId, DemoParser parser)
        {
            var serverClassID = (int)reader.ReadInt(parser.SendTableParser.ClassBits);
            var entityClass = parser.SendTableParser.ServerClasses[serverClassID];
            var serialNumber = reader.ReadInt(10);

            var existingEntity = parser.Entities[entityId];
            if (existingEntity != null && existingEntity.SerialNumber == serialNumber)
            {
                existingEntity.ApplyUpdate(reader);
                return existingEntity;
            }

            // Serial numbers are different, delete the entity
            if (existingEntity != null)
            {
                existingEntity.ServerClass.AnnounceDestroyedEntity(existingEntity);
                existingEntity.Leave();
                parser.Entities[entityId] = null;
            }

            var newEntity = new Entity(entityId, serialNumber, entityClass);
            newEntity.ServerClass.AnnounceNewEntity(newEntity);

            //And then parse the instancebaseline. 
            //basically you could call
            //newEntity.ApplyUpdate(parser.instanceBaseline[entityClass]; 
            //This code below is just faster, since it only parses stuff once
            //which is faster.

            object[] fastBaseline;
            if (parser.PreprocessedBaselines.TryGetValue(serverClassID, out fastBaseline))
            {
                PropertyEntry.Emit(newEntity, fastBaseline);
            }
            else
            {
                var preprocessedBaseline = new List<object>();
                if (parser.instanceBaseline.ContainsKey(serverClassID))
                {
                    using (new PropertyCollector(newEntity, preprocessedBaseline))
                    using (var bitStream = BitStreamUtil.Create(parser.instanceBaseline[serverClassID]))
                    {
                        newEntity.ApplyUpdate(bitStream);
                    }
                }

                parser.PreprocessedBaselines.Add(serverClassID, preprocessedBaseline.ToArray());
            }

            newEntity.ApplyUpdate(reader);

            return newEntity;
        }

        private class PropertyCollector : IDisposable
        {
            private readonly Entity Underlying;
            private readonly IList<object> Capture;

            public PropertyCollector(Entity underlying, IList<object> capture)
            {
                Underlying = underlying;
                Capture = capture;

                foreach (var prop in Underlying.Props)
                {
                    switch (prop.Entry.Prop.Type)
                    {
                        case SendPropertyType.Array:
                            prop.ArrayRecived += HandleArrayRecived;
                            break;
                        case SendPropertyType.Float:
                            prop.FloatRecived += HandleFloatRecived;
                            break;
                        case SendPropertyType.Int:
                            prop.IntRecived += HandleIntRecived;
                            break;
                        case SendPropertyType.Int64:
                            prop.Int64Received += HandleInt64Received;
                            break;
                        case SendPropertyType.String:
                            prop.StringRecived += HandleStringRecived;
                            break;
                        case SendPropertyType.Vector:
                        case SendPropertyType.VectorXY:
                            prop.VectorRecived += HandleVectorRecived;
                            break;
                        default:
                            throw new NotImplementedException();
                    }
                }
            }

            private void HandleVectorRecived(object sender, PropertyUpdateEventArgs<Vector> e)
            {
                Capture.Add(e.Record());
            }

            private void HandleStringRecived(object sender, PropertyUpdateEventArgs<string> e)
            {
                Capture.Add(e.Record());
            }

            private void HandleIntRecived(object sender, PropertyUpdateEventArgs<int> e)
            {
                Capture.Add(e.Record());
            }

            private void HandleInt64Received(object sender, PropertyUpdateEventArgs<long> e)
            {
                Capture.Add(e.Record());
            }

            private void HandleFloatRecived(object sender, PropertyUpdateEventArgs<float> e)
            {
                Capture.Add(e.Record());
            }

            private void HandleArrayRecived(object sender, PropertyUpdateEventArgs<object[]> e)
            {
                Capture.Add(e.Record());
            }

            public void Dispose()
            {
                foreach (var prop in Underlying.Props)
                {
                    switch (prop.Entry.Prop.Type)
                    {
                        case SendPropertyType.Array:
                            prop.ArrayRecived -= HandleArrayRecived;
                            break;
                        case SendPropertyType.Float:
                            prop.FloatRecived -= HandleFloatRecived;
                            break;
                        case SendPropertyType.Int:
                            prop.IntRecived -= HandleIntRecived;
                            break;
                        case SendPropertyType.Int64:
                            prop.Int64Received -= HandleInt64Received;
                            break;
                        case SendPropertyType.String:
                            prop.StringRecived -= HandleStringRecived;
                            break;
                        case SendPropertyType.Vector:
                        case SendPropertyType.VectorXY:
                            prop.VectorRecived -= HandleVectorRecived;
                            break;
                        default:
                            throw new NotImplementedException();
                    }
                }
            }
        }
    }
}
