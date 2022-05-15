using DemoInfo.Messages;
using DemoInfo.DP.FastNetmessages;

namespace DemoInfo.DP
{
    public static class DemoPacketParser
    {
        /// <summary>
        /// Parses a demo-packet. 
        /// </summary>
        /// <param name="bitstream">Bitstream.</param>
        /// <param name="demo">Demo.</param>
        public static void ParsePacket(IBitStream bitstream, DemoParser demo)
        {
            //As long as there is stuff to read
            while (!bitstream.ChunkFinished)
            {
                int cmd = bitstream.ReadProtobufVarInt(); //What type of packet is this?
                int length = bitstream.ReadProtobufVarInt(); //And how long is it?
                bitstream.BeginChunk(length * 8); //read length bytes
                if (cmd == (int)SVC_Messages.svc_PacketEntities)
                {
                    //Parse packet entities
                    new PacketEntities().Parse(bitstream, demo);
                }
                else if (cmd == (int)SVC_Messages.svc_GameEventList)
                {
                    //and all this other stuff
                    new GameEventList().Parse(bitstream, demo);
                }
                else if (cmd == (int)SVC_Messages.svc_GameEvent)
                {
                    new GameEvent().Parse(bitstream, demo);
                }
                else if (cmd == (int)SVC_Messages.svc_CreateStringTable)
                {
                    new CreateStringTable().Parse(bitstream, demo);
                }
                else if (cmd == (int)SVC_Messages.svc_UpdateStringTable)
                {
                    new UpdateStringTable().Parse(bitstream, demo);
                }
                else if (cmd == (int)NET_Messages.net_Tick)
                {
                    //and all this other stuff
                    new NETTick().Parse(bitstream, demo);
                }
                else if (cmd == (int)NET_Messages.net_SetConVar)
                {
                    new SetConVar().Parse(bitstream, demo);
                }
                else if (cmd == (int)SVC_Messages.svc_UserMessage)
                {
                    new UserMessage().Parse(bitstream, demo);
                }
                else if (cmd == (int)SVC_Messages.svc_EncryptedData)
                {
                    if (demo.NetMessageDecryptionKey != null)
                    {
                        new EncryptedMessage().Parse(bitstream, demo);
                    }
                }

                bitstream.EndChunk();
            }
        }
    }
}
