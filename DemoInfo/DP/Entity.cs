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

		public PropertyEntry[] Props { get; private set; }

		public Entity(int id, ServerClass serverClass)
		{
			this.ID = id;
			this.ServerClass = serverClass;

			Props = new PropertyEntry[ServerClass.flattenedProps.Count];
			int i = 0;
			foreach (var prop in ServerClass.flattenedProps) {
				Props[i++] = new PropertyEntry(prop);
			}
		}

		public PropertyEntry FindProperty(string name)
		{
			return Props.Single(a => a.Entry.PropertyName == name);
		}

		public void ApplyUpdate(IBitStream reader)
		{
			bool newWay = reader.ReadBit();
			int index = -1;
			var entries = new List<PropertyEntry>();
			while ((index = ReadFieldIndex(reader, index, newWay)) != -1)
				entries.Add(this.Props[index]);

			foreach (var prop in entries) {
				prop.Decode(reader);
			}
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

	class PropertyEntry
	{
		public FlattenedPropEntry Entry { get; private set; }

		public event EventHandler<IntUpdateEventArgs> IntRecived;
		public event EventHandler<FloatUpdateEventArgs> FloatRecived;
		public event EventHandler<VectorUpdateEventArgs> VectorRecived;
		public event EventHandler<StringUpdateEventArgs> StringRecived;
		public event EventHandler<LongUpdateEventArgs> LongRecived;
		public event EventHandler<ArrayUpdateEventArgs> ArrayRecived;

		public void Decode(IBitStream stream)
		{
			switch (Entry.Prop.Type) {
			case SendPropertyType.Int:
				{
					var val = PropDecoder.DecodeInt(Entry.Prop, stream);
					if (IntRecived != null)
						IntRecived(this, new IntUpdateEventArgs(val));
				}
				break;
			case SendPropertyType.Float:
				{
					var val = PropDecoder.DecodeFloat(Entry.Prop, stream);
					if (FloatRecived != null)
						FloatRecived(this, new FloatUpdateEventArgs(val));
				}
				break;
			case SendPropertyType.Vector:
				{
					var val = PropDecoder.DecodeVector(Entry.Prop, stream);
					if (VectorRecived != null)
						VectorRecived(this, new VectorUpdateEventArgs(val));
				}
				break;
			case SendPropertyType.Array:
				{
					var val = PropDecoder.DecodeArray(Entry, stream);
					if (ArrayRecived != null)
						ArrayRecived(this, new ArrayUpdateEventArgs(val));
				}
				break;
			case SendPropertyType.String:
				{
					var val = PropDecoder.DecodeString(Entry.Prop, stream);
					if (StringRecived != null)
						StringRecived(this, new StringUpdateEventArgs(val));
				}
				break;
			case SendPropertyType.VectorXY:
				{
					var val = PropDecoder.DecodeVectorXY(Entry.Prop, stream);
					if (VectorRecived != null)
						VectorRecived(this, new VectorUpdateEventArgs(val));
				}
				break;
			default:
				throw new NotImplementedException("Could not read property. Abort! ABORT! (is it a long?)");
			}
		}

		public PropertyEntry(FlattenedPropEntry prop)
		{
			this.Entry = new FlattenedPropEntry(prop.PropertyName, prop.Prop, prop.ArrayElementProp);
		}
	}

	#region Update-Types
	class PropertyUpdateEventArgs : EventArgs
	{

	}

	class IntUpdateEventArgs : PropertyUpdateEventArgs
	{
		public int Value { get; private set; }

		public IntUpdateEventArgs(int value)
		{
			this.Value = value;
		}
	}

	class FloatUpdateEventArgs : PropertyUpdateEventArgs
	{
		public float Value { get; private set; }

		public FloatUpdateEventArgs(float value)
		{
			this.Value = value;
		}
	}

	class VectorUpdateEventArgs : PropertyUpdateEventArgs
	{
		public Vector Value { get; private set; }

		public VectorUpdateEventArgs(Vector value)
		{
			this.Value = value;
		}
	}

	class StringUpdateEventArgs : PropertyUpdateEventArgs
	{
		public string Value { get; private set; }

		public StringUpdateEventArgs(string value)
		{
			this.Value = value;
		}
	}

	class LongUpdateEventArgs : PropertyUpdateEventArgs
	{
		public long Value { get; private set; }

		public LongUpdateEventArgs(long value)
		{
			this.Value = value;
		}
	}

	class ArrayUpdateEventArgs : PropertyUpdateEventArgs
	{
		//TODO: Improve this. 
		public object[] Values { get; private set; }

		public ArrayUpdateEventArgs(object[] values)
		{
			this.Values = values;
		}
	}

	#endregion
}
