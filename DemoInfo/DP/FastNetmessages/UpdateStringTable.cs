using System;
using System.IO;

namespace DemoInfo
{
	public struct UpdateStringTable
	{
		public Int32 TableId;
		public Int32 NumChangedEntries;

		public void Parse(IBitStream bitstream, DemoParser parser)
		{
			while (!bitstream.ChunkFinished) {
				var desc = bitstream.ReadProtobufVarInt();
				var wireType = desc & 7;
				var fieldnum = desc >> 3;

				if ((wireType == 2) && (fieldnum == 3)) {
					// String data is special.
					// We'll simply hope that gaben is nice and sends
					// string_data last, just like he should.
					var len = bitstream.ReadProtobufVarInt();
					bitstream.BeginChunk(len * 8);
					DemoInfo.DP.Handler.UpdateStringTableUserInfoHandler.Apply(this, bitstream, parser);
					bitstream.EndChunk();
					if (!bitstream.ChunkFinished)
						throw new NotImplementedException("Lord Gaben wasn't nice to us :/");
					break;
				}

				if (wireType != 0)
					throw new InvalidDataException();

				var val = bitstream.ReadProtobufVarInt();

				switch (fieldnum) {
				case 1:
					TableId = val;
					break;
				case 2:
					NumChangedEntries = val;
					break;
				default:
					// silently drop
					break;
				}
			}
		}
	}
}

