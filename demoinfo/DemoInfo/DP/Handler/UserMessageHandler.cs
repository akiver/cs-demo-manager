using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using DemoInfo.Messages;

namespace DemoInfo.DP.Handler
{
	#if SLOW_PROTOBUF
	public class UserMessageHandler : IMessageParser
	{
		private const long VALVE_MAGIC_NUMBER = 76561197960265728;

		public bool TryApplyMessage(ProtoBuf.IExtensible message, DemoParser parser)
		{
			CSVCMsg_UserMessage userMessage = message as CSVCMsg_UserMessage;

			if (userMessage == null || !Enum.IsDefined(typeof(ECstrike15UserMessages), userMessage.msg_type))
				return false;

			ECstrike15UserMessages msg = (ECstrike15UserMessages)userMessage.msg_type;
			Type toParse = Assembly.GetExecutingAssembly().GetType("DemoInfo.Messages.CCSUsrMsg_" + msg.ToString().Substring(6));

			using (var memstream = new MemoryStream(userMessage.msg_data))
			{
				ProtoBuf.IExtensible data = memstream.ReadProtobufMessage(toParse);
				if (data != null)
				{
					switch (data.GetType().Name)
					{
						case "CCSUsrMsg_SayText":
							{
								SayTextEventArgs e = new SayTextEventArgs();
								CCSUsrMsg_SayText sayMsg = (CCSUsrMsg_SayText)data;
								e.Text = sayMsg.text;
								e.TextAllChat = sayMsg.textallchat;
								e.Chat = sayMsg.chat;
								parser.RaiseSayText(e);
								break;
							}
						case "CCSUsrMsg_SayText2":
							{
								SayText2EventArgs e = new SayText2EventArgs();
								CCSUsrMsg_SayText2 sayMsg = (CCSUsrMsg_SayText2)data;
								e.TextAllChat = sayMsg.textallchat;
								e.Chat = sayMsg.chat;

								// get the player who wrote the message
								foreach (KeyValuePair<int, Player> keyValuePair in parser.Players)
								{
									if (keyValuePair.Value.Name == sayMsg.@params[0])
									{
										e.Sender = parser.Players[keyValuePair.Key];
										break;
									}
								}

								// @params is a 4 length array but only 2 are used [0] = nickname [1] = message text
								e.Text = sayMsg.@params[0] + " : " + sayMsg.@params[1];
								parser.RaiseSayText2(e);
								break;
							}
						case "CCSUsrMsg_ServerRankUpdate":
							{
								ServerRankUpdateEventArgs e = new ServerRankUpdateEventArgs
								{
									RankStructList = new List<ServerRankUpdateEventArgs.RankStruct>()
								};

								CCSUsrMsg_ServerRankUpdate rankMsg = (CCSUsrMsg_ServerRankUpdate)data;

								foreach (CCSUsrMsg_ServerRankUpdate.RankUpdate rankUpdate in (rankMsg.rank_update))
								{
									ServerRankUpdateEventArgs.RankStruct rankStruct = new ServerRankUpdateEventArgs.RankStruct
									{
										New = rankUpdate.rank_new,
										Old = rankUpdate.rank_old,
										NumWins = rankUpdate.num_wins,
										RankChange = rankUpdate.rank_change,
										SteamId = rankUpdate.account_id + VALVE_MAGIC_NUMBER
									};
									e.RankStructList.Add(rankStruct);
								}

								parser.RaiseServerRankUpdate(e);

								break;
							}
						default:
							// TODO: maybe, like, implement something here one day?
							//Problem: There is no real useful info here if I see it correcly. Sorry.
							//var messageType = (Messages.ECstrike15UserMessages)userMessage.msg_type;
							return true;
					}
				}
				return false;
			}
		}

		public int Priority { get { return 0; } }
	}
	#endif
}
