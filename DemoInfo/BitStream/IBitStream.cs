using System;
using System.IO;

namespace DemoInfo
{
	public interface IBitStream : IDisposable
	{
		void Initialize(Stream stream);

		uint ReadInt(int bits);
		int ReadSignedInt(int numBits);
		bool ReadBit();
		byte ReadByte();
		byte ReadByte(int bits);
		byte[] ReadBytes(int bytes);
		float ReadFloat();
		byte[] ReadBits(int bits);
		int ReadProtobufVarInt();

		// Chunking: You can begin chunks with a specified length.
		// You can then determine whether you've already read
		// the full chunk. You can also end the chunk and skip
		// ahead to where you would be had you read everything.
		// Chunks can be nested and it'll work just like you'd
		// expect (stack-like).
		//
		// tl;dr bitstream chunks are basically LimitStreams

		/// <summary>
		/// Begins a chunk.
		/// </summary>
		/// <param name="bits">The chunk's length in bits.</param>
		/// <remarks>
		/// You must not try to read beyond the end of a chunk. Doing
		/// so may corrupt the bitstream's state, leading to
		/// implementation-defined behavior of all methods except
		/// <c>Dispose</c>.
		/// </remarks>
		void BeginChunk(int bits);

		/// <summary>
		/// Ends a chunk.
		/// </summary>
		/// <remarks>
		/// If there's no current chunk, this method <c>may</c> throw
		/// and leave the bitstream in an undefined state that can
		/// be cleaned up safely by disposing it.
		/// Alternatively, it may also return normally if it didn't
		/// corrupt or otherwise modify the bitstream's state.
		/// </remarks>
		void EndChunk();

		/// <summary>
		/// Gets a value indicating whether the current chunk was fully read.
		/// </summary>
		/// <value><c>true</c> if chunk is finished; otherwise, <c>false</c>.</value>
		/// <remarks>
		/// The return value is undefined if there's no current chunk.
		/// </remarks>
		bool ChunkFinished { get; }
	}
}

