using System;
using System.Text;
using System.Net.Sockets;
using System.Threading;

namespace Services.Concrete
{
    internal class TelnetConnection : IDisposable
    {
        private enum Verbs
        {
            WILL = 251,
            WONT = 252,
            DO = 253,
            DONT = 254,
            IAC = 255,
        }
        private enum Options
        {
            SGA = 3,
        }

        private readonly TcpClient _tcpSocket;
        private const int READ_TIMEOUT_IN_MS = 100;

        public TelnetConnection(string hostname, int port)
        {
            _tcpSocket = new TcpClient(hostname, port);
        }

        public void Write(string cmd)
        {
            if (!_tcpSocket.Connected)
            {
                return;
            }

            cmd += "\n";
            var buf = Encoding.ASCII.GetBytes(cmd.Replace("\0xFF", "\0xFF\0xFF"));
            _tcpSocket.GetStream().Write(buf, 0, buf.Length);
        }

        public string Read()
        {
            if (!_tcpSocket.Connected)
            {
                return null;
            }
            
            var sb = new StringBuilder();
            do
            {
                ParseTelnet(sb);
                Thread.Sleep(READ_TIMEOUT_IN_MS);
            } while (_tcpSocket.Available > 0);

            return sb.ToString();
        }

        private void ParseTelnet(StringBuilder sb)
        {
            while (_tcpSocket.Available > 0)
            {
                var input = _tcpSocket.GetStream().ReadByte();
                switch (input)
                {
                    case -1:
                        break;
                    case (int)Verbs.IAC:
                        var inputVerb = _tcpSocket.GetStream().ReadByte();
                        if (inputVerb == -1)
                        {
                            break;
                        }
                        switch (inputVerb)
                        {
                            case (int)Verbs.IAC:
                                sb.Append(inputVerb);
                                break;
                            case (int)Verbs.DO:
                            case (int)Verbs.DONT:
                            case (int)Verbs.WILL:
                            case (int)Verbs.WONT:
                                var inputOption = _tcpSocket.GetStream().ReadByte();
                                if (inputOption == -1)
                                {
                                    break;
                                }
                                _tcpSocket.GetStream().WriteByte((byte)Verbs.IAC);
                                if (inputOption == (int)Options.SGA)
                                {
                                    _tcpSocket.GetStream().WriteByte(inputVerb == (int)Verbs.DO ? (byte)Verbs.WILL : (byte)Verbs.DO);
                                }
                                else
                                {
                                    _tcpSocket.GetStream().WriteByte(inputVerb == (int)Verbs.DO ? (byte)Verbs.WONT : (byte)Verbs.DONT);
                                }
                                _tcpSocket.GetStream().WriteByte((byte)inputOption);
                                break;
                        }
                        break;
                    default:
                        sb.Append((char)input);
                        break;
                }
            }
        }

        public void Dispose()
        {
            _tcpSocket.Dispose();
        }
    }
}
