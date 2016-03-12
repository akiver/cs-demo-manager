namespace DemoInfo.DP.FastNetmessages
{
	/// <summary>
	/// FastNetMessage adaptation of CCSUsrMsg_ServerRankUpdate.RankUpdate protobuf message
	/// </summary>
	public class RankUpdate
	{
		public int AccountId;
		public int RankOld;
		public int RankNew;
		public int NumWins;
		public float RankChange;

		public RankUpdate Parse(IBitStream bitstream, DemoParser parser)
		{
			while (!bitstream.ChunkFinished)
			{
				var desc = bitstream.ReadProtobufVarInt();
				var wireType = desc & 7;
				var fieldnum = desc >> 3;

				if (wireType == 0 && fieldnum == 1)
				{
					AccountId = bitstream.ReadProtobufVarInt();
				}
				else if(wireType == 0 && fieldnum == 2)
				{
					RankOld = bitstream.ReadProtobufVarInt();
				}
				else if (wireType == 0 && fieldnum == 3)
				{
					RankNew = bitstream.ReadProtobufVarInt();
				}
				else if (wireType == 0 && fieldnum == 4)
				{
					NumWins = bitstream.ReadProtobufVarInt();
				}
				else if (wireType == 5 && fieldnum == 5)
				{
					RankChange = bitstream.ReadFloat();
				}
			}

			return this;
		}
	}
}
