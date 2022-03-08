using System;
using System.Linq;
using System.Numerics;
using System.Text.RegularExpressions;

namespace Core
{
    /// <summary>
    /// Tool class to generate the demo share code from a CDataGCCStrike15_v2_MatchInfo proto message.
    /// https://github.com/SteamRE/SteamKit/blob/master/Resources/Protobufs/csgo/cstrike15_gcmessages.proto#L753
    /// 
    /// Process to generate the share code:
    /// 
    /// Fields required from the protobuf message are:
    /// - uint64 match_id
    /// - uint64 reservationid from the last repeated entry in roundstatsall, or if that doesn’t exist from roundstats_legacy
    /// - uint16 low bits of uint32 tv_port
    /// 
    /// From this 3 fields, we have to generate a big 144-bit number (thanks to the BigInteger C# class it makes it easier).
    /// Next, the big number has to be run with a base57 encoding process against the string "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefhijkmnopqrstuvwxyz23456789".
    /// 
    /// Thanks to the CSGO dev Vitaliy for his explanation.
    /// </summary>
    public class ShareCode
    {
        private const string DICTIONARY = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefhijkmnopqrstuvwxyz23456789";
        private const string SHARECODE_PATTERN = "^CSGO(-?[\\w]{5}){5}$";

        public struct ShareCodeStruct
        {
            public ulong MatchId;
            public ulong OutcomeId; // reservation id
            public uint TokenId; // tv port
        }

        /// <summary>
        /// Encode a share code from required fields coming from a CDataGCCStrike15_v2_MatchInfo message.
        /// </summary>
        /// <param name="matchId"></param>
        /// <param name="reservationId"></param>
        /// <param name="tvPort"></param>
        /// <returns></returns>
        public static string Encode(ulong matchId, ulong reservationId, uint tvPort)
        {
            byte[] matchIdBytes = BitConverter.GetBytes(matchId);
            byte[] reservationBytes = BitConverter.GetBytes(reservationId);
            // only the UInt16 low bits from the TV port are used
            ushort tvPort16 = (ushort)(tvPort & ((1 << 16) - 1));
            byte[] tvBytes = BitConverter.GetBytes(tvPort16);

            byte[] bytes = new byte[matchIdBytes.Length + reservationBytes.Length + tvBytes.Length + 1];

            Buffer.BlockCopy(new byte[] { 0 }, 0, bytes, 0, 1);
            Buffer.BlockCopy(matchIdBytes, 0, bytes, 1, matchIdBytes.Length);
            Buffer.BlockCopy(reservationBytes, 0, bytes, 1 + matchIdBytes.Length, reservationBytes.Length);
            Buffer.BlockCopy(tvBytes, 0, bytes, 1 + matchIdBytes.Length + reservationBytes.Length, tvBytes.Length);

            BigInteger big = new BigInteger(bytes.Reverse().ToArray());

            char[] charArray = DICTIONARY.ToCharArray();
            string c = "";

            for (int i = 0; i < 25; i++)
            {
                BigInteger rem;
                BigInteger.DivRem(big, charArray.Length, out rem);
                c += charArray[(int)rem];
                big = BigInteger.Divide(big, charArray.Length);
            }

            return $"CSGO-{c.Substring(0, 5)}-{c.Substring(5, 5)}-{c.Substring(10, 5)}-{c.Substring(15, 5)}-{c.Substring(20, 5)}";
        }

        /// <summary>
        /// Decode a share code from the string.
        /// </summary>
        /// <param name="shareCode"></param>
        /// <returns></returns>
        public static ShareCodeStruct Decode(string shareCode)
        {
            Regex r = new Regex(SHARECODE_PATTERN);
            if (!r.IsMatch(shareCode))
            {
                throw new ShareCodePatternException();
            }

            string code = shareCode.Remove(0, 4).Replace("-", "");

            BigInteger big = BigInteger.Zero;
            foreach (char c in code.ToCharArray().Reverse())
            {
                big = BigInteger.Multiply(big, DICTIONARY.Length) + DICTIONARY.IndexOf(c);
            }

            byte[] matchIdBytes = new byte[sizeof(ulong)];
            byte[] outcomeIdBytes = new byte[sizeof(ulong)];
            byte[] tvPortIdBytes = new byte[sizeof(uint)];

            byte[] all = big.ToByteArray().ToArray();
            // sometimes the number isn't unsigned, add a 00 byte at the end of the array to make sure it is
            if (all.Length != 2 * sizeof(ulong) + sizeof(ushort))
            {
                all = all.Concat(new byte[] { 0 }).ToArray();
            }

            all = all.Reverse().ToArray();
            Array.Copy(all, 0, matchIdBytes, 0, sizeof(ulong));
            Array.Copy(all, sizeof(ulong), outcomeIdBytes, 0, sizeof(ulong));
            Array.Copy(all, 2 * sizeof(ulong), tvPortIdBytes, 0, sizeof(ushort));

            ShareCodeStruct s = new ShareCodeStruct
            {
                MatchId = BitConverter.ToUInt64(matchIdBytes, 0),
                OutcomeId = BitConverter.ToUInt64(outcomeIdBytes, 0),
                TokenId = BitConverter.ToUInt32(tvPortIdBytes, 0),
            };

            return s;
        }

        public class ShareCodePatternException : Exception
        {
            public ShareCodePatternException() : base("Invalid share code")
            {
            }
        }
    }
}
