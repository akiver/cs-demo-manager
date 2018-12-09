using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;
using DemoInfo.DT;

namespace DemoInfo.DP.Handler
{
	static class PropDecoder
	{
		public static object DecodeProp(FlattenedPropEntry prop, IBitStream stream)
		{
			var sendProp = prop.Prop;
			switch (sendProp.Type) {
			case SendPropertyType.Int:
				return DecodeInt(sendProp, stream);
			case SendPropertyType.Int64:
				return DecodeInt64(sendProp, stream);
			case SendPropertyType.Float:
				return DecodeFloat(sendProp, stream);
			case SendPropertyType.Vector:
				return DecodeVector(sendProp, stream);
			case SendPropertyType.Array:
				var test = DecodeArray(prop, stream);
				return test;
			case SendPropertyType.String:
				return DecodeString(sendProp, stream);
			case SendPropertyType.VectorXY:
				return DecodeVectorXY(sendProp, stream);
			default:
				throw new NotImplementedException("Could not read property. Abort! ABORT!");
			}
		}

		public static int DecodeInt(SendTableProperty prop, IBitStream reader)
		{
			if (prop.Flags.HasFlagFast(SendPropertyFlags.VarInt)) {
				if (prop.Flags.HasFlagFast(SendPropertyFlags.Unsigned)) {
					return (int)reader.ReadVarInt();
				} else {
					return (int)reader.ReadSignedVarInt();
				}
			} else {
				if (prop.Flags.HasFlagFast(SendPropertyFlags.Unsigned)) {
					return (int)reader.ReadInt(prop.NumberOfBits);
				} else {
					return reader.ReadSignedInt(prop.NumberOfBits);
				}
			}
		}

		public static long DecodeInt64(SendTableProperty prop, IBitStream reader)
		{
			if (prop.Flags.HasFlagFast(SendPropertyFlags.VarInt))
			{
				if (prop.Flags.HasFlagFast(SendPropertyFlags.Unsigned))
				{
					return reader.ReadVarInt();
				}
				else
				{
					return reader.ReadSignedVarInt();
				}
			}
			else
			{
				bool isNegative = false;
				uint low = 0;
				uint high = 0;

				if (prop.Flags.HasFlag(SendPropertyFlags.Unsigned))
				{
					low = reader.ReadInt(32);
					high = reader.ReadInt(prop.NumberOfBits - 32);
				}
				else
				{
					isNegative = reader.ReadBit();
					low = reader.ReadInt(32);
					high = reader.ReadInt(prop.NumberOfBits - 32 - 1);
				}

				long result = ((long)high << 32) | low;

				if (isNegative)
					result = -result;

				return result;
			}
		}

		public static float DecodeFloat(SendTableProperty prop, IBitStream reader)
		{
			float fVal = 0.0f;
			ulong dwInterp;

			if (DecodeSpecialFloat(prop, reader, out fVal))
				return fVal;

            
			//Encoding: The range between lowVal and highVal is splitted into the same steps.
			//Read an int, fit it into the range. 
			dwInterp = reader.ReadInt(prop.NumberOfBits);
			fVal = (float)dwInterp / ( ( 1 << prop.NumberOfBits ) - 1 );
			fVal = prop.LowValue + ( prop.HighValue - prop.LowValue ) * fVal;

			return fVal;
		}

		public static Vector DecodeVector(SendTableProperty prop, IBitStream reader)
		{
			if (prop.Flags.HasFlagFast(SendPropertyFlags.Normal)) {
            
			}

			Vector v = new Vector();

			v.X = DecodeFloat(prop, reader);
			v.Y = DecodeFloat(prop, reader);

			if (!prop.Flags.HasFlagFast(SendPropertyFlags.Normal)) {
				v.Z = DecodeFloat(prop, reader);
			} else {
				bool isNegative = reader.ReadBit();

				//v0v0v1v1 in original instead of margin. 
				float absolute = v.X * v.X + v.Y * v.Y;
				if (absolute < 1.0f) {
					v.Z = (float)Math.Sqrt(1 - absolute);
				} else {
					v.Z = 0f;
				}

				if (isNegative)
					v.Z *= -1;
			}

			return v;
		}

		public static object[] DecodeArray(FlattenedPropEntry flattenedProp, IBitStream reader)
		{
			int numElements = flattenedProp.Prop.NumberOfElements;
			int maxElements = numElements;

			int numBits = 1;

			while (( maxElements >>= 1 ) != 0) {
				numBits++;
			}

			int nElements = (int)reader.ReadInt(numBits);

			object[] result = new object[nElements];

			FlattenedPropEntry temp = new FlattenedPropEntry("", flattenedProp.ArrayElementProp, null);
			for (int i = 0; i < nElements; i++) {
				result[i] = DecodeProp(temp, reader);
			}

			return result;
		}

		public static string DecodeString(SendTableProperty prop, IBitStream reader)
		{
			return Encoding.Default.GetString(reader.ReadBytes((int)reader.ReadInt(9)));
		}

		public static Vector DecodeVectorXY(SendTableProperty prop, IBitStream reader)
		{
			Vector v = new Vector();
			v.X = DecodeFloat(prop, reader);
			v.Y = DecodeFloat(prop, reader);

			return v;
		}

		#region Float-Stuff

		static bool DecodeSpecialFloat(SendTableProperty prop, IBitStream reader, out float result)
		{
			if (prop.Flags.HasFlagFast(SendPropertyFlags.Coord)) {
				result = ReadBitCoord(reader);
				return true;
			} else if (prop.Flags.HasFlagFast(SendPropertyFlags.CoordMp)) {
				result = ReadBitCoordMP(reader, false, false);
				return true;
			} else if (prop.Flags.HasFlagFast(SendPropertyFlags.CoordMpLowPrecision)) {
				result = ReadBitCoordMP(reader, false, true);
				return true;
			} else if (prop.Flags.HasFlagFast(SendPropertyFlags.CoordMpIntegral)) {
				result = ReadBitCoordMP(reader, true, false);
				return true;
			} else if (prop.Flags.HasFlagFast(SendPropertyFlags.NoScale)) {
				result = reader.ReadFloat();
				return true;
			} else if (prop.Flags.HasFlagFast(SendPropertyFlags.Normal)) {
				result = ReadBitNormal(reader);
				return true;
			} else if (prop.Flags.HasFlagFast(SendPropertyFlags.CellCoord)) {
				result = ReadBitCellCoord(reader, prop.NumberOfBits, false, false);
				return true;
			} else if (prop.Flags.HasFlagFast(SendPropertyFlags.CellCoordLowPrecision)) {
				result = ReadBitCellCoord(reader, prop.NumberOfBits, true, false);
				return true;
			} else if (prop.Flags.HasFlagFast(SendPropertyFlags.CellCoordIntegral)) {
				result = ReadBitCellCoord(reader, prop.NumberOfBits, false, true);
				return true;
			}
			result = 0;

			return false;
		}

		static readonly int COORD_FRACTIONAL_BITS = 5;
		static readonly int COORD_DENOMINATOR = ( 1 << ( COORD_FRACTIONAL_BITS ) );
		static readonly float COORD_RESOLUTION = ( 1.0f / ( COORD_DENOMINATOR ) );

		static readonly int COORD_FRACTIONAL_BITS_MP_LOWPRECISION = 3;
		static readonly float COORD_DENOMINATOR_LOWPRECISION = ( 1 << ( COORD_FRACTIONAL_BITS_MP_LOWPRECISION ) );
		static readonly float COORD_RESOLUTION_LOWPRECISION = ( 1.0f / ( COORD_DENOMINATOR_LOWPRECISION ) );

		static float ReadBitCoord(IBitStream reader)
		{
			int intVal, fractVal;
			float value = 0;

			bool isNegative = false;

			// Read the required integer and fraction flags
			intVal = (int)reader.ReadInt(1);
			fractVal = (int)reader.ReadInt(1);

			// If we got either parse them, otherwise it's a zero.
			if (( intVal | fractVal ) != 0) {
				// Read the sign bit
				isNegative = reader.ReadBit();

				// If there's an integer, read it in
				if (intVal == 1) {
					// Adjust the integers from [0..MAX_COORD_VALUE-1] to [1..MAX_COORD_VALUE]
					intVal = (int)reader.ReadInt(14) + 1; //14 --> Coord int bits
				}

				//If there's a fraction, read it in
				if (fractVal == 1) {
					fractVal = (int)reader.ReadInt(COORD_FRACTIONAL_BITS); 
				}

				value = intVal + ( (float)fractVal * COORD_RESOLUTION );

			}

			if (isNegative)
				value *= -1;

			return value;
		}

		static float ReadBitCoordMP(IBitStream reader, bool isIntegral, bool isLowPrecision)
		{
			int intval = 0, fractval = 0;
			float value = 0.0f;
			bool isNegative = false;

			bool inBounds = reader.ReadBit();

			if (isIntegral) {
				// Read the required integer and fraction flags
				intval = reader.ReadBit() ? 1 : 0;

				// If we got either parse them, otherwise it's a zero.
				if (intval == 1) {
					// Read the sign bit
					isNegative = reader.ReadBit();

					// If there's an integer, read it in
					// Adjust the integers from [0..MAX_COORD_VALUE-1] to [1..MAX_COORD_VALUE]
					if (inBounds) {
						value = (float)( reader.ReadInt(11) + 1 );
					} else {
						value = (float)( reader.ReadInt(14) + 1 );
					}
				}
			} else {
				// Read the required integer and fraction flags
				intval = reader.ReadBit() ? 1 : 0;

				// Read the sign bit
				isNegative = reader.ReadBit();

				// If we got either parse them, otherwise it's a zero.
				if (intval == 1) {

					// If there's an integer, read it in
					// Adjust the integers from [0..MAX_COORD_VALUE-1] to [1..MAX_COORD_VALUE]
					if (inBounds) {
						value = (float)( reader.ReadInt(11) + 1 );
					} else {
						value = (float)( reader.ReadInt(14) + 1 );
					}
				}

				// If there's a fraction, read it in
				fractval = (int)reader.ReadInt(isLowPrecision ? 3 : 5);

				// Calculate the correct floating point value
				value = intval + ( (float)fractval * ( isLowPrecision ? COORD_RESOLUTION_LOWPRECISION : COORD_RESOLUTION ) );
			}

			if (isNegative)
				value = -value;

			return value;
		}

		static float ReadBitCellCoord(IBitStream reader, int bits, bool lowPrecision, bool integral)
		{
			int intval = 0, fractval = 0;
			float value = 0.0f;

			if (integral) {
				value = (float)reader.ReadInt(bits);
			} else {
				intval = (int)reader.ReadInt(bits);
				fractval = (int)reader.ReadInt(lowPrecision ? COORD_FRACTIONAL_BITS_MP_LOWPRECISION : COORD_FRACTIONAL_BITS);


				value = intval + ( (float)fractval * ( lowPrecision ? COORD_RESOLUTION_LOWPRECISION : COORD_RESOLUTION ) );
			}

			return value;

		}

		static readonly int NORMAL_FRACTIONAL_BITS = 11;
		static readonly int NORMAL_DENOMINATOR = ( ( 1 << ( NORMAL_FRACTIONAL_BITS ) ) - 1 );
		static readonly float NORMAL_RESOLUTION = ( 1.0f / ( NORMAL_DENOMINATOR ) );

		static float ReadBitNormal(IBitStream reader)
		{
			bool isNegative = reader.ReadBit();

			uint fractVal = reader.ReadInt(NORMAL_FRACTIONAL_BITS);

			float value = (float)fractVal * NORMAL_RESOLUTION;

			if (isNegative)
				value *= -1;

			return value;
		}

		#endregion
	}
}
