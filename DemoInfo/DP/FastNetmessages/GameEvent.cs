using System;
using System.IO;
using System.Collections.Generic;
using DemoInfo.DP.Handler;

namespace DemoInfo
{
	public struct GameEvent
	{
		public string EventName;
		public Int32 EventId;
		public IList<object> Keys;

		public void Parse(IBitStream bitstream, DemoParser parser)
		{
			Keys = new List<object>();
			while (!bitstream.ChunkFinished) {
				var desc = bitstream.ReadProtobufVarInt();
				var wireType = desc & 7;
				var fieldnum = desc >> 3;
				if ((wireType == 2) && (fieldnum == 1)) {
					EventName = bitstream.ReadProtobufString();
				} else if ((wireType == 0) && (fieldnum == 2)) {
					EventId = bitstream.ReadProtobufVarInt();
				} else if ((wireType == 2) && (fieldnum == 3)) {
					bitstream.BeginChunk(bitstream.ReadProtobufVarInt() * 8);
					/*
					 * Hope and pray that gaben is once again nice to us and
					 * sends 'type' first, then the respective member, then NOTHING.
					 */
					desc = bitstream.ReadProtobufVarInt();
					wireType = desc & 7;
					fieldnum = desc >> 3;
					if ((wireType != 0) || (fieldnum != 1))
						throw new InvalidDataException("Lord Gaben wasn't nice to us :/");

					var typeMember = bitstream.ReadProtobufVarInt();
					desc = bitstream.ReadProtobufVarInt();
					wireType = desc & 7;
					fieldnum = desc >> 3;

					if (fieldnum != (typeMember + 1))
						throw new InvalidDataException("Lord Gaben wasn't nice to us :/ (srsly wtf!?)");

					switch (typeMember) {
					case 1: // string
						if (wireType != 2)
							throw new InvalidDataException("proto definition differs");
						Keys.Add(bitstream.ReadProtobufString());
						break;
					case 2: // float
						if (wireType != 5)
							throw new InvalidDataException("proto definition differs");
						Keys.Add(bitstream.ReadFloat());
						break;
					case 3: // long
					case 4: // short
					case 5: // byte
						if (wireType != 0)
							throw new InvalidDataException("proto definition differs");
						Keys.Add(bitstream.ReadProtobufVarInt());
						break;
					case 6: // bool
						if (wireType != 0)
							throw new InvalidDataException("proto definition differs");
						Keys.Add(bitstream.ReadProtobufVarInt() != 0);
						break;
					default:
						throw new InvalidDataException("Looks like they introduced a new type");
					}

					if (!bitstream.ChunkFinished)
						throw new InvalidDataException("Lord Gaben tricked us! D:");

					bitstream.EndChunk();
				} else
					throw new InvalidDataException();
			}

			GameEventHandler.Apply(this, parser);
		}
	}
}

