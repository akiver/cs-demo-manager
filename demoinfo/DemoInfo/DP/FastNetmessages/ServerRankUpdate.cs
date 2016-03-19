using System.IO;

namespace DemoInfo.DP.FastNetmessages
{
	/// <summary>
	/// FastNetMessage adaptation of CCSUsrMsg_ServerRankUpdate protobuf message
	/// We don't raise this event but instead each RankUpdate events that it contains
	/// </summary>
	public struct ServerRankUpdate
	{
		public void Parse(IBitStream bitstream, DemoParser parser)
		{
			while (!bitstream.ChunkFinished)
			{
				var desc = bitstream.ReadProtobufVarInt();
				var wireType = desc & 7;
				var fieldnum = desc >> 3;

				if (wireType == 2 && fieldnum == 1)
				{
					bitstream.BeginChunk(bitstream.ReadProtobufVarInt() * 8);
					new RankUpdate().Parse(bitstream, parser);
					bitstream.EndChunk();
				}
				else
					throw new InvalidDataException();
			}
		}
	}
}
