using System.IO;

namespace DemoInfo.DP.FastNetmessages
{
    public struct VoiceInit
    {
        public int Quality;
        public string Codec;
        public int Version;

        public void Parse(IBitStream bitstream, DemoParser parser)
        {
            while (!bitstream.ChunkFinished)
            {
                var desc = bitstream.ReadProtobufVarInt();
                var wireType = desc & 7;
                var fieldnum = desc >> 3;

                if (wireType == 0 && fieldnum == 1)
                {
                    Quality = bitstream.ReadProtobufVarInt();
                }
                else if (wireType == 2 && fieldnum == 2)
                {
                    Codec = bitstream.ReadProtobufString();
                }
                else if (wireType == 0 && fieldnum == 3)
                {
                    Version = bitstream.ReadProtobufVarInt();
                }
                else
                {
                    throw new InvalidDataException();
                }
            }

            Raise(parser);
        }

        private void Raise(DemoParser parser)
        {
            var e = new VoiceInitEventArgs
            {
                Quality = Quality,
                Codec = Codec,
                Version = Version,
            };

            parser.RaiseVoiceInit(e);
        }
    }
}
