using DemoInfo.DP.Handler;
using DemoInfo.DT;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DemoInfo.DP
{
    internal class Entity
    {
        public int ID { get; set; }
        public uint SerialNumber { get; set; }

        public ServerClass ServerClass { get; set; }

        public PropertyEntry[] Props { get; private set; }

        public Entity(int id, uint serialNumber, ServerClass serverClass)
        {
            ID = id;
            SerialNumber = serialNumber;
            ServerClass = serverClass;

            var flattenedProps = ServerClass.FlattenedProps;
            Props = new PropertyEntry[flattenedProps.Count];
            for (int i = 0; i < flattenedProps.Count; i++)
            {
                Props[i] = new PropertyEntry(flattenedProps[i], i);
            }
        }

        public PropertyEntry FindProperty(string name)
        {
            return Props.Single(a => a.Entry.PropertyName == name);
        }

        /// <summary>
        /// Applies the update.
        /// </summary>
        /// <param name="reader">Reader.</param>
        public void ApplyUpdate(IBitStream reader)
        {
            //Okay, how does an entity-update look like?
            //First a list of the updated props is sent
            //And then the props itself are sent.


            //Read the field-indicies in a "new" way?
            bool newWay = reader.ReadBit();
            int index = -1;
            var entries = new List<PropertyEntry>();

            //No read them. 
            while ((index = ReadFieldIndex(reader, index, newWay)) != -1)
            {
                entries.Add(Props[index]);
            }

            //Now read the updated props
            foreach (var prop in entries)
            {
                prop.Decode(reader, this);
            }
        }

        private int ReadFieldIndex(IBitStream reader, int lastIndex, bool bNewWay)
        {
            if (bNewWay)
            {
                if (reader.ReadBit())
                {
                    return lastIndex + 1;
                }
            }

            int ret = 0;
            if (bNewWay && reader.ReadBit())
            {
                ret = (int)reader.ReadInt(3); // read 3 bits
            }
            else
            {
                ret = (int)reader.ReadInt(7); // read 7 bits
                switch (ret & (32 | 64))
                {
                    case 32:
                        ret = (ret & ~96) | ((int)reader.ReadInt(2) << 5);
                        break;
                    case 64:
                        ret = (ret & ~96) | ((int)reader.ReadInt(4) << 5);
                        break;
                    case 96:
                        ret = (ret & ~96) | ((int)reader.ReadInt(7) << 5);
                        break;
                }
            }

            if (ret == 0xFFF)
            {
                // end marker is 4095 for cs:go
                return -1;
            }

            return lastIndex + 1 + ret;
        }

        public void Leave()
        {
            foreach (var prop in Props)
            {
                prop.Destroy();
            }
        }

        public override string ToString()
        {
            return ID + ": " + ServerClass;
        }
    }

    internal class PropertyEntry
    {
        public readonly int Index;
        public FlattenedPropEntry Entry { get; private set; }

        public event EventHandler<PropertyUpdateEventArgs<int>> IntRecived;
        public event EventHandler<PropertyUpdateEventArgs<long>> Int64Received;
        public event EventHandler<PropertyUpdateEventArgs<float>> FloatRecived;
        public event EventHandler<PropertyUpdateEventArgs<Vector>> VectorRecived;
        public event EventHandler<PropertyUpdateEventArgs<string>> StringRecived;
        public event EventHandler<PropertyUpdateEventArgs<object[]>> ArrayRecived;

        public void Decode(IBitStream stream, Entity e)
        {
            //So here you start decoding. If you really want 
            //to implement this yourself, GOOD LUCK. 
            //also, be warned: They have 11 ways to read floats. 
            //oh, btw: You may want to read the original Valve-code for this. 
            switch (Entry.Prop.Type)
            {
                case SendPropertyType.Int:
                {
                    var val = PropDecoder.DecodeInt(Entry.Prop, stream);
                    if (IntRecived != null)
                    {
                        IntRecived(this, new PropertyUpdateEventArgs<int>(val, e, this));
                    }
                }
                    break;
                case SendPropertyType.Int64:
                {
                    var val = PropDecoder.DecodeInt64(Entry.Prop, stream);
                    if (Int64Received != null)
                    {
                        Int64Received(this, new PropertyUpdateEventArgs<long>(val, e, this));
                    }
                }
                    break;
                case SendPropertyType.Float:
                {
                    var val = PropDecoder.DecodeFloat(Entry.Prop, stream);
                    if (FloatRecived != null)
                    {
                        FloatRecived(this, new PropertyUpdateEventArgs<float>(val, e, this));
                    }
                }
                    break;
                case SendPropertyType.Vector:
                {
                    var val = PropDecoder.DecodeVector(Entry.Prop, stream);
                    if (VectorRecived != null)
                    {
                        VectorRecived(this, new PropertyUpdateEventArgs<Vector>(val, e, this));
                    }
                }
                    break;
                case SendPropertyType.Array:
                {
                    var val = PropDecoder.DecodeArray(Entry, stream);
                    if (ArrayRecived != null)
                    {
                        ArrayRecived(this, new PropertyUpdateEventArgs<object[]>(val, e, this));
                    }
                }
                    break;
                case SendPropertyType.String:
                {
                    var val = PropDecoder.DecodeString(Entry.Prop, stream);
                    if (StringRecived != null)
                    {
                        StringRecived(this, new PropertyUpdateEventArgs<string>(val, e, this));
                    }
                }
                    break;
                case SendPropertyType.VectorXY:
                {
                    var val = PropDecoder.DecodeVectorXY(Entry.Prop, stream);
                    if (VectorRecived != null)
                    {
                        VectorRecived(this, new PropertyUpdateEventArgs<Vector>(val, e, this));
                    }
                }
                    break;
                default:
                    throw new NotImplementedException("Could not read property. Abort! ABORT! (is it a long?)");
            }
        }

        public PropertyEntry(FlattenedPropEntry prop, int index)
        {
            Entry = new FlattenedPropEntry(prop.PropertyName, prop.Prop, prop.ArrayElementProp);
            Index = index;
        }

        public void Destroy()
        {
            IntRecived = null;
            Int64Received = null;
            FloatRecived = null;
            ArrayRecived = null;
            StringRecived = null;
            VectorRecived = null;
        }

        public override string ToString()
        {
            return string.Format("[PropertyEntry: Entry={0}]", Entry);
        }

        public static void Emit(Entity entity, object[] captured)
        {
            foreach (var arg in captured)
            {
                var intReceived = arg as RecordedPropertyUpdate<int>;
                var int64Received = arg as RecordedPropertyUpdate<long>;
                var floatReceived = arg as RecordedPropertyUpdate<float>;
                var vectorReceived = arg as RecordedPropertyUpdate<Vector>;
                var stringReceived = arg as RecordedPropertyUpdate<string>;
                var arrayReceived = arg as RecordedPropertyUpdate<object[]>;

                if (intReceived != null)
                {
                    var e = entity.Props[intReceived.PropIndex].IntRecived;
                    if (e != null)
                    {
                        e(null, new PropertyUpdateEventArgs<int>(intReceived.Value, entity, entity.Props[intReceived.PropIndex]));
                    }
                }
                else if (int64Received != null)
                {
                    var e = entity.Props[int64Received.PropIndex].Int64Received;
                    if (e != null)
                    {
                        e(null, new PropertyUpdateEventArgs<long>(int64Received.Value, entity, entity.Props[int64Received.PropIndex]));
                    }
                }
                else if (floatReceived != null)
                {
                    var e = entity.Props[floatReceived.PropIndex].FloatRecived;
                    if (e != null)
                    {
                        e(null, new PropertyUpdateEventArgs<float>(floatReceived.Value, entity, entity.Props[floatReceived.PropIndex]));
                    }
                }
                else if (vectorReceived != null)
                {
                    var e = entity.Props[vectorReceived.PropIndex].VectorRecived;
                    if (e != null)
                    {
                        e(null, new PropertyUpdateEventArgs<Vector>(vectorReceived.Value, entity, entity.Props[vectorReceived.PropIndex]));
                    }
                }
                else if (stringReceived != null)
                {
                    var e = entity.Props[stringReceived.PropIndex].StringRecived;
                    if (e != null)
                    {
                        e(null, new PropertyUpdateEventArgs<string>(stringReceived.Value, entity, entity.Props[stringReceived.PropIndex]));
                    }
                }
                else if (arrayReceived != null)
                {
                    var e = entity.Props[arrayReceived.PropIndex].ArrayRecived;
                    if (e != null)
                    {
                        e(null, new PropertyUpdateEventArgs<object[]>(arrayReceived.Value, entity, entity.Props[arrayReceived.PropIndex]));
                    }
                }
                else
                {
                    throw new NotImplementedException();
                }
            }
        }
    }

    #region Update-Types

    internal class PropertyUpdateEventArgs<T> : EventArgs
    {
        public T Value { get; private set; }

        public Entity Entity { get; private set; }

        public PropertyEntry Property { get; private set; }

        public PropertyUpdateEventArgs(T value, Entity e, PropertyEntry p)
        {
            Value = value;
            Entity = e;
            Property = p;
        }
    }

    public class RecordedPropertyUpdate<T>
    {
        public int PropIndex;
        public T Value;

        public RecordedPropertyUpdate(int propIndex, T value)
        {
            PropIndex = propIndex;
            Value = value;
        }
    }

    #endregion
}
