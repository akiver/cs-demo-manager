using System;
using System.Linq;
using System.Numerics;

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
		const string DICTIONARY = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefhijkmnopqrstuvwxyz23456789";

		/// <summary>
		/// Generate the share code from required fields coming from a CDataGCCStrike15_v2_MatchInfo message.
		/// </summary>
		/// <param name="matchId"></param>
		/// <param name="reservationId"></param>
		/// <param name="tvPort"></param>
		/// <returns></returns>
		public static string GenerateShareCode(UInt64 matchId, UInt64 reservationId, UInt32 tvPort)
		{
			byte[] matchIdBytes = BitConverter.GetBytes(matchId);
			byte[] reservationBytes = BitConverter.GetBytes(reservationId);
			// only the UInt16 low bits from the TV port are used
			UInt16 tvPort16 = Uint32ToUint16(tvPort);
			byte[] tvBytes = BitConverter.GetBytes(tvPort16);

			byte[] bytes = CombineBytes(matchIdBytes, reservationBytes, tvBytes);

			BigInteger big = new BigInteger(bytes.Reverse().ToArray());

			string sharecode = EncodeAgainstString(big);

			return sharecode;
		}

		/// <summary>
		/// Combine all bytes in one byte array.
		/// </summary>
		/// <param name="matchIdBytes"></param>
		/// <param name="reservationBytes"></param>
		/// <param name="tvBytes"></param>
		/// <returns></returns>
		private static byte[] CombineBytes(byte[] matchIdBytes, byte[] reservationBytes, byte[] tvBytes)
		{
			byte[] result = new byte[matchIdBytes.Length + reservationBytes.Length + tvBytes.Length + 1];

			Buffer.BlockCopy(new byte[] { 0 }, 0, result, 0, 1);
			Buffer.BlockCopy(matchIdBytes, 0, result, 1, matchIdBytes.Length);
			Buffer.BlockCopy(reservationBytes, 0, result, 1 + matchIdBytes.Length, reservationBytes.Length);
			Buffer.BlockCopy(tvBytes, 0, result, 1 + matchIdBytes.Length + reservationBytes.Length, tvBytes.Length);

			return result;
		}

		/// <summary>
		/// Run the base57 encoding process against the the giant number.
		/// </summary>
		/// <param name="input"></param>
		/// <returns></returns>
		private static String EncodeAgainstString(BigInteger input)
		{
			char[] charArray = DICTIONARY.ToCharArray();
			string result = "CSGO";
			int charCount = 0;

			while (input != 0)
			{
				if (charCount % 5 == 0) result += "-";
				BigInteger rem;
				BigInteger.DivRem(input, charArray.Length, out rem);
				result += charArray[(int)rem];
				input = BigInteger.Divide(input, charArray.Length);
				charCount++;
			}

			return result;
		}

		private static ushort Uint32ToUint16(UInt32 val)
		{
			return (ushort)(val & ((1 << 16) - 1));
		}
	}
}
