using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using DemoInfo.DT;
using DemoInfo.DP;
#if SLOW_PROTOBUF
using ProtoBuf;
#endif

namespace DemoInfo
{
	static class Helper
	{
		public static string ReadCString(this BinaryReader reader, int length)
		{
			return ReadCString(reader, length, Encoding.UTF8);
		}

		public static int ReadInt32SwapEndian(this BinaryReader reader)
		{
			return BitConverter.ToInt32(reader.ReadBytes(4).Reverse().ToArray(), 0);
		}

		public static long ReadInt64SwapEndian(this BinaryReader reader)
		{
			return BitConverter.ToInt64(reader.ReadBytes(8).Reverse().ToArray(), 0);
		}

		public static string Reverse(this string s)
		{
			char[] charArray = s.ToCharArray();
			Array.Reverse(charArray);
			return new string(charArray);
		}

		public static string ReadCString(this BinaryReader reader, int length, Encoding encoding)
		{
			return encoding.GetString(reader.ReadBytes(length)).Split(new char[] { '\0' }, 2)[0];  
		}

		public static int ReadVarInt32(this BinaryReader reader)
		{
			int b = 0, count = 0, result = 0;

			do {
				if (count > 5)
					throw new InvalidDataException("VarInt32 out of range");

				b = reader.ReadByte();

				result |= ( b & 0x7F ) << ( 7 * count );

				count++;
			} while (( b & 0x80 ) != 0);

			return result;
		}

		public static string ReadNullTerminatedString(this BinaryReader reader)
		{
			return ReadNullTerminatedString(reader, Encoding.Default);
		}

		public static string ReadNullTerminatedString(this BinaryReader reader, Encoding encoding)
		{
			return ReadNullTerminatedString(reader, encoding, 512);
		}


		public static string ReadNullTerminatedString(this BinaryReader reader, Encoding encoding, int initialBufferSize)
		{
			List<byte> result = new List<byte>(initialBufferSize);

			while (true) {
				byte b = reader.ReadByte();
                
				if (b == 0)
					break;

				result.Add(b);
			}

			return Encoding.Default.GetString(result.ToArray());
		}

		#if SLOW_PROTOBUF
		public static T ReadProtobufMessage<T>(this BinaryReader reader)
		{
			return ReadProtobufMessage<T>(reader, PrefixStyle.Base128);
		}

		public static T ReadProtobufMessage<T>(this BinaryReader reader, PrefixStyle style)
		{
			return Serializer.DeserializeWithLengthPrefix<T>(reader.BaseStream, style);
		}

		public static IExtensible ReadProtobufMessage(this BinaryReader reader, Type T, PrefixStyle style)
		{
			var type = typeof(Serializer);
			var deserialize = type.GetMethod("DeserializeWithLengthPrefix", new Type[] {
				typeof(Stream),
				typeof(PrefixStyle)
			});

			deserialize = deserialize.MakeGenericMethod(T);

			return (IExtensible)deserialize.Invoke(null, new object[] { reader.BaseStream, style });
		}

		public static IExtensible ReadProtobufMessage(this Stream stream, Type T)
		{
			var type = typeof(Serializer);
			var deserialize = type.GetMethod("Deserialize", new Type[] {
				typeof(Stream),
			});

			deserialize = deserialize.MakeGenericMethod(T);

			return (IExtensible)deserialize.Invoke(null, new object[] { stream });
		}
		#endif

		public static TValue GetValueOrDefault<TKey, TValue>(this IDictionary<TKey, TValue> dictionary, TKey key, TValue defaultValue)
		{
			TValue value;
			return dictionary.TryGetValue(key, out value) ? value : defaultValue;
		}

		public static bool HasFlagFast(this SendPropertyFlags flags, SendPropertyFlags check)
		{
			return (flags & check) == check;
		}

		public static RecordedPropertyUpdate<T> Record<T>(this PropertyUpdateEventArgs<T> args)
		{
			return new RecordedPropertyUpdate<T>(args.Property.Index, args.Value);
		}
	}
}
