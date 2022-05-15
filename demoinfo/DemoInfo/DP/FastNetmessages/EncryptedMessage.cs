using System.IO;
using DemoInfo.DP.Handler;

namespace DemoInfo.DP.FastNetmessages
{
    public struct EncryptedMessage
    {
        public int KeyType;
        public byte[] Encrypted;

        public void Parse(IBitStream bitstream, DemoParser parser)
        {
            while (!bitstream.ChunkFinished)
            {
                var desc = bitstream.ReadProtobufVarInt();
                var wireType = desc & 7;
                var fieldnum = desc >> 3;

                if (wireType == 0 && fieldnum == 2)
                {
                    KeyType = bitstream.ReadProtobufVarInt();
                }
                else if (wireType == 2 && fieldnum == 1)
                {
                    Encrypted = bitstream.ReadBytes(bitstream.ReadProtobufVarInt());
                }
                else
                {
                    throw new InvalidDataException();
                }
            }

            EncryptedDataHandler.Apply(this, parser);
        }
    }
}
