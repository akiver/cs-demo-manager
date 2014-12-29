using System;
using System.IO;

namespace DemoInfo
{
	public struct PacketEntities
	{
		// These are uints but should be ints
		// please forgive me the inaccuracy
		public UInt32 MaxEntries;
		public UInt32 UpdatedEntries;
		private UInt32 _IsDelta;
		public bool IsDelta { get { return _IsDelta != 0; } }
		private UInt32 _UpdateBaseline;
		public bool UpdateBaseline { get { return _UpdateBaseline != 0; } }
		public UInt32 Baseline;
		public UInt32 DeltaFrom;

		public void Parse(IBitStream bitstream, DemoParser parser)
		{
			while (!bitstream.ChunkFinished) {
				var desc = bitstream.ReadProtobufVarInt();
				var wireType = desc & 7;
				var fieldnum = desc >> 3;

				if ((fieldnum == 7) && (wireType == 2)) {
					// Entity data is special.
					// We'll simply hope that gaben is nice and sends
					// entity_data last, just like he should.

					var len = bitstream.ReadProtobufVarInt();
					bitstream.BeginChunk(len * 8);
					DemoInfo.DP.Handler.PacketEntitesHandler.Apply(this, bitstream, parser);
					bitstream.EndChunk();
					if (!bitstream.ChunkFinished)
						throw new NotImplementedException("Lord Gaben wasn't nice to us :/");
					break;
				}

				if (wireType != 0)
					throw new InvalidDataException();

				var val = (uint)bitstream.ReadProtobufVarInt();

				switch (fieldnum) {
				case 1:
					MaxEntries = val;
					break;
				case 2:
					UpdatedEntries = val;
					break;
				case 3:
					_IsDelta = val;
					break;
				case 4:
					_UpdateBaseline = val;
					break;
				case 5:
					Baseline = val;
					break;
				case 6:
					DeltaFrom = val;
					break;
				default:
					// silently drop
					break;
				}
			}
		}
	}
}

