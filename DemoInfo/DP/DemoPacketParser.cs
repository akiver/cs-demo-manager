using DemoInfo.Messages;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace DemoInfo.DP
{
	public static class DemoPacketParser
    {
		private static IEnumerable<IMessageParser> Parsers = (
			from type in Assembly.GetExecutingAssembly().GetTypes()
			where type.GetInterfaces().Contains(typeof(IMessageParser))
			let parser = (IMessageParser)type.GetConstructor(new Type[0]).Invoke(new object[0])
			orderby -parser.Priority
			select parser).ToArray();

		public static void ParsePacket(IBitStream bitstream, DemoParser demo)
        {
			while (!bitstream.ChunkFinished)
            {
				int cmd = bitstream.ReadProtobufVarInt();

				if (cmd == (int)NET_Messages.net_Tick) {
					new NETTick().Parse(bitstream);
					continue;
				} else if (cmd == (int)SVC_Messages.svc_PacketEntities) {
					new PacketEntities().Parse(bitstream, demo);
					continue;
				} else if (cmd == (int)SVC_Messages.svc_EncryptedData) {
					int length = bitstream.ReadProtobufVarInt();
					bitstream.BeginChunk(length * 8);
					// TODO: maybe one day find the key for this?
					bitstream.EndChunk();
					continue;
				}

                Type toParse = null;

                if (Enum.IsDefined(typeof(SVC_Messages), cmd))
                {
                    SVC_Messages msg = (SVC_Messages)cmd;
                    toParse = Assembly.GetExecutingAssembly().GetType("DemoInfo.Messages.CSVCMsg_" + msg.ToString().Substring(4));
                }
                else if (Enum.IsDefined(typeof(NET_Messages), cmd))
                {
                    NET_Messages msg = (NET_Messages)cmd;
                    toParse = Assembly.GetExecutingAssembly().GetType("DemoInfo.Messages.CNETMsg_" + msg.ToString().Substring(4));
                }

				var data = bitstream.ReadBytes(bitstream.ReadProtobufVarInt());
                if (toParse == null)
                    continue;

				ProtoBuf.IExtensible result;
				using (var memstream = new MemoryStream(data))
					result = memstream.ReadProtobufMessage(toParse);

                foreach (var parser in Parsers)
					if (parser.TryApplyMessage(result, demo) && (parser.Priority > 0))
						break;
            }
        }
    }
}
