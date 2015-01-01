using System;
using System.Collections.Generic;
using System.IO;

namespace DemoInfo
{
	public struct SendTable
	{
		public struct SendProp
		{
			public Int32 Type;
			public string VarName;
			public Int32 Flags;
			public Int32 Priority;
			public string DtName;
			public Int32 NumElements;
			public float LowValue;
			public float HighValue;
			public Int32 NumBits;

			public void Parse(IBitStream bitstream)
			{
				while (!bitstream.ChunkFinished) {
					var desc = bitstream.ReadProtobufVarInt();
					var wireType = desc & 7;
					var fieldnum = desc >> 3;

					if (wireType == 2) {
						if (fieldnum == 2) {
							VarName = bitstream.ReadProtobufString();
						} else if (fieldnum == 5) {
							DtName = bitstream.ReadProtobufString();
						} else
							throw new InvalidDataException("yes I know we should drop this but we" +
								"probably want to know that they added a new big field");
					} else if (wireType == 0) {
						var val = bitstream.ReadProtobufVarInt();

						switch (fieldnum) {
						case 1:
							Type = val;
							break;
						case 3:
							Flags = val;
							break;
						case 4:
							Priority = val;
							break;
						case 6:
							NumElements = val;
							break;
						case 9:
							NumBits = val;
							break;
						default:
							// silently drop
							break;
						}
					} else if (wireType == 5) {
						var val = bitstream.ReadFloat();

						switch (fieldnum) {
						case 7:
							LowValue = val;
							break;
						case 8:
							HighValue = val;
							break;
						default:
							// silently drop
							break;
						}
					} else
						throw new InvalidDataException();
				}
			}
		}

		private Int32 _IsEnd;
		public bool IsEnd { get { return _IsEnd != 0; } }
		public string NetTableName;
		public Int32 _NeedsDecoder;
		public bool NeedsDecoder { get { return _NeedsDecoder != 0; } }

		public IEnumerable<SendProp> Parse(IBitStream bitstream) {
			var sendprops = new List<SendProp>();

			while (!bitstream.ChunkFinished) {
				var desc = bitstream.ReadProtobufVarInt();
				var wireType = desc & 7;
				var fieldnum = desc >> 3;

				if (wireType == 2) {
					if (fieldnum == 2) {
						NetTableName = bitstream.ReadProtobufString();
					} else if (fieldnum == 4) {
						// Props are special.
						// We'll simply hope that gaben is nice and sends
						// props last, just like he should.
						var len = bitstream.ReadProtobufVarInt();
						bitstream.BeginChunk(len * 8);
						var sendprop = new SendProp();
						sendprop.Parse(bitstream);
						sendprops.Add(sendprop);
						bitstream.EndChunk();
					} else
						throw new InvalidDataException("yes I know we should drop this" +
							"but we probably want to know that they added a new big field");
				} else if (wireType == 0) {
					var val = bitstream.ReadProtobufVarInt();

					switch (fieldnum) {
					case 1:
						_IsEnd = val;
						break;
					case 3:
						_NeedsDecoder = val;
						break;
					default:
						// silently drop
						break;
					}
				} else
					throw new InvalidDataException();
			}

			return sendprops;
		}
	}
}

