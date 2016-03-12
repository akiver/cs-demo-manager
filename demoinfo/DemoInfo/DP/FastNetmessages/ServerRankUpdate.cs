using System.Collections.Generic;
using System.IO;

namespace DemoInfo.DP.FastNetmessages
{
	/// <summary>
	/// FastNetMessage adaptation of CCSUsrMsg_ServerRankUpdate protobuf message
	/// </summary>
	public class ServerRankUpdate
	{
		private const long VALVE_MAGIC_NUMBER = 76561197960265728;

		public IList<RankUpdate> RankUpdateList;

		public void Parse(IBitStream bitstream, DemoParser parser)
		{
			RankUpdateList = new List<RankUpdate>();
			while (!bitstream.ChunkFinished)
			{
				var desc = bitstream.ReadProtobufVarInt();
				var wireType = desc & 7;
				var fieldnum = desc >> 3;

				if (wireType == 2 && fieldnum == 1)
				{
					bitstream.BeginChunk(bitstream.ReadProtobufVarInt() * 8);
					RankUpdateList.Add(new RankUpdate().Parse(bitstream, parser));
					bitstream.EndChunk();
				}
				else
					throw new InvalidDataException();
			}
			Raise(parser);
		}

		private void Raise(DemoParser parser)
		{
			ServerRankUpdateEventArgs e = new ServerRankUpdateEventArgs
			{
				RankUpdateList = new List<RankUpdateEventArgs>()
			};
			foreach (RankUpdate rankUpdate in RankUpdateList)
			{
				e.RankUpdateList.Add(new RankUpdateEventArgs
				{
					SteamId = rankUpdate.AccountId + VALVE_MAGIC_NUMBER,
					RankOld = rankUpdate.RankOld,
					RankNew = rankUpdate.RankNew,
					WinCount = rankUpdate.NumWins,
					RankChange = rankUpdate.RankChange
				});
			}
			parser.RaiseServerRankUpdate(e);
		}
	}
}
