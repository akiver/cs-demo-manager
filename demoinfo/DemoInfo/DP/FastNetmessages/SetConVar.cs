using System.IO;

namespace DemoInfo.DP.FastNetmessages
{
    /// <summary>
    /// FastNetMessage adaptation of CNETMsg_SetConVar protobuf message
    /// https://github.com/SteamRE/SteamKit/blob/master/Resources/Protobufs/csgo/netmessages.proto#L137
    /// </summary>
    public struct SetConVar
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
                    new CVars().Parse(bitstream, parser);
                    bitstream.EndChunk();
                }
                else
                {
                    throw new InvalidDataException();
                }
            }
        }
    }
}
