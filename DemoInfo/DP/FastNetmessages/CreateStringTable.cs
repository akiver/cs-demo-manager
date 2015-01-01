using System;
using System.IO;

namespace DemoInfo
{
	public struct CreateStringTable
	{
		public string Name;
		public Int32 MaxEntries;
		public Int32 NumEntries;
		private Int32 _UserDataFixedSize;
		public bool UserDataFixedSize { get { return _UserDataFixedSize != 0; }}
		public Int32 UserDataSize;
		public Int32 UserDataSizeBits;
		public Int32 Flags;

		public void Parse(IBitStream bitstream, DemoParser parser)
		{
			while (!bitstream.ChunkFinished) {
				var desc = bitstream.ReadProtobufVarInt();
				var wireType = desc & 7;
				var fieldnum = desc >> 3;

				if (wireType == 2) {
					if (fieldnum == 1) {
						Name = bitstream.ReadProtobufString();
						continue;
					} else if (fieldnum == 8) {
						// String data is special.
						// We'll simply hope that gaben is nice and sends
						// string_data last, just like he should.
						var len = bitstream.ReadProtobufVarInt();
						bitstream.BeginChunk(len * 8);
						DemoInfo.DP.Handler.CreateStringTableUserInfoHandler.Apply(this, bitstream, parser);
						bitstream.EndChunk();
						if (!bitstream.ChunkFinished)
							throw new NotImplementedException("Lord Gaben wasn't nice to us :/");
						break;
					} else
						throw new InvalidDataException("yes I know we should drop this but we" +
							"probably want to know that they added a new big field");
				}

				if (wireType != 0)
					throw new InvalidDataException();

				var val = bitstream.ReadProtobufVarInt();

				switch (fieldnum) {
				case 2:
					MaxEntries = val;
					break;
				case 3:
					NumEntries = val;
					break;
				case 4:
					_UserDataFixedSize = val;
					break;
				case 5:
					UserDataSize = val;
					break;
				case 6:
					UserDataSizeBits = val;
					break;
				case 7:
					Flags = val;
					break;
				default:
					// silently drop
					break;
				}
			}
		}
	}
}

