using DemoInfo.DP.FastNetmessages;
using DemoInfo.Messages;

namespace DemoInfo.DP.Handler
{
    public static class EncryptedDataHandler
    {
        public static void Apply(EncryptedMessage msg, DemoParser parser)
        {
            bool isPublicKey = msg.KeyType == 2;
            if (!isPublicKey)
            {
                return;
            }

            byte[] decrypted = parser.NetMessageDecryptionKey.DecryptFull(msg.Encrypted);
            int messageSize = decrypted.Length;
            var br = BitStreamUtil.Create(decrypted);
            int bytesPadding = 1;
            int bytesWrittenPadding = 4;

            byte paddingBytes = br.ReadByte();
            if (paddingBytes >= messageSize - bytesPadding - bytesWrittenPadding)
            {
                return;
            }

            br.ReadBits(paddingBytes << 3);

            byte[] bytesWritten = br.ReadBytes(4);
            int bytesWrittenCount = bytesWritten[3] | bytesWritten[2] << 8 | bytesWritten[1] << 16 | bytesWritten[0] << 24;

            if (bytesPadding + bytesWrittenPadding + paddingBytes + bytesWrittenCount != messageSize)
            {
                return;
            }

            int cmd = br.ReadProtobufVarInt();
            int size = br.ReadProtobufVarInt();

            switch (cmd)
            {
                case (int)SVC_Messages.svc_UserMessage:
                    byte[] data = br.ReadBytes(size);
                    var bitstream = BitStreamUtil.Create(data);
                    bitstream.BeginChunk(size * 8);
                    new UserMessage().Parse(bitstream, parser);
                    bitstream.EndChunk();
                    break;
            }
        }
    }
}
