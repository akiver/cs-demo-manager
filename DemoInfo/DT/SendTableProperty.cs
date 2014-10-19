using System;

namespace DemoInfo.DT
{
	public class SendTableProperty
	{
		public SendPropertyFlags Flags { get { return (SendPropertyFlags)RawFlags; } }

		public int RawFlags { get; set; }

		public string Name { get; set; }

		public string DataTableName { get; set; }

		public float LowValue { get; set; }

		public float HighValue { get; set; }

		public int NumberOfBits { get; set; }

		public int NumberOfElements { get; set; }

		public int Priority { get; set; }

		public int RawType { get; set; }

		public SendPropertyType Type {
			get {
				return (SendPropertyType)RawType;
			}
		}
	}

    public enum SendPropertyType
    {
        Int = 0,
        Float = 1,
        Vector = 2,
        VectorXY = 3,
        String = 4,
        Array = 5,
        DataTable = 6,
        Int64 = 7,
    };


    [Flags]
    public enum SendPropertyFlags
    {
        /// <summary>
        /// Unsigned integer data.
        /// </summary>
        Unsigned = (1 << 0),
        /// <summary>
        /// If this is set, the float/vector is treated like a world coordinate. 
        /// Note that the bit count is ignored in this case.
        /// </summary>
        Coord = (1 << 1),
        /// <summary>
        /// For floating point, don't scale into range, just take value as is
        /// </summary>
        NoScale = (1 << 2),
        /// <summary>
        /// For floating point, limit high value to range minus one bit unit
        /// </summary>
        RoundDown = (1 << 3),
        ///<summary>
        /// For floating point, limit low value to range minus one bit unit
        ///</summary>
        RoundUp = (1 << 4),
        ///<summary>
        /// If this is set, the vector is treated like a normal (only valid for vectors)
        ///</summary>
        Normal = (1 << 5),
        ///<summary>
        /// This is an exclude prop (not excludED, but it points at another prop to be excluded).
        ///</summary>
        Exclude = (1 << 6),
        ///<summary>
        /// Use XYZ/Exponent encoding for vectors.
        ///</summary>
        XYZE = (1 << 7),
        ///<summary>
        /// This tells us that the property is inside an array, so it shouldn't be put into the
        /// flattened property list. Its array will point at it when it needs to.
        ///</summary>
        InsideArray = (1 << 8),
        ///<summary>
        /// Set for datatable props using one of the default datatable proxies like
        /// SendProxy_DataTableToDataTable that always send the data to all clients.
        ///</summary>
        ProxyAlwaysYes = (1 << 9),
        ///<summary>
        /// Set automatically if SPROP_VECTORELEM is used.
        ///</summary>
        IsVectorElement = (1 << 10),
        ///<summary>
        /// Set automatically if it's a datatable with an offset of 0 that doesn't change the pointer
        /// (ie: for all automatically-chained base classes).
        /// In this case, it can get rid of this SendPropDataTable altogether and spare the
        /// trouble of walking the hierarchy more than necessary.
        ///</summary>
        Collapsible = (1 << 11),
        ///<summary>
        /// Like SPROP_COORD, but special handling for multiplayer games
        ///</summary>
        CoordMp = (1 << 12),
        /// <summary>
        /// Like SPROP_COORD, but special handling for multiplayer games where the fractional component only gets a 3 bits instead of 5
        /// </summary>
        CoordMpLowPrecision = (1 << 13),
        /// <summary>
        /// SPROP_COORD_MP, but coordinates are rounded to integral boundaries
        /// </summary>
        CoordMpIntegral = (1 << 14),

        /// <summary>
        /// Like SPROP_COORD, but special encoding for cell coordinates that can't be negative, bit count indicate maximum value
        /// </summary>
        CellCoord = (1 << 15),

        /// <summary>
        /// Like SPROP_CELL_COORD, but special handling where the fractional component only gets a 3 bits instead of 5
        /// </summary>
        CellCoordLowPrecision = (1 << 16),

        /// <summary>
        /// SPROP_CELL_COORD, but coordinates are rounded to integral boundaries
        /// </summary>
        CellCoordIntegral = (1 << 17),

        ///<summary>
        /// this is an often changed field, moved to head of sendtable so it gets a small index
        ///</summary>
        ChangesOften = (1 << 18),

        /// <summary>
        /// use var int encoded (google protobuf style), note you want to include SPROP_UNSIGNED if needed, its more efficient
        /// </summary>
        VarInt = (1 << 19)
    }
}

