using NUnit.Framework;
using System;
using System.IO;
using System.Linq;

using DemoInfo;
using DemoInfo.BitStreamImpl;
using System.Collections.Generic;

namespace Testing
{
	[TestFixture]
	public class TestBitstreams
	{
		private Random rng;
		private byte[] data;
		private IBitStream dbgAll;

		private IBitStream CreateBS(byte[] data)
		{
			IBitStream managed = new ManagedBitStream(), @unsafe = new UnsafeBitStream();
			managed.Initialize(new AwkwardStream(new MemoryStream(data), rng));
			@unsafe.Initialize(new AwkwardStream(new MemoryStream(data), rng));
			return new DebugBitStream(new BitArrayStream(data), new DebugBitStream(managed, @unsafe));
		}

		[SetUp]
		public void Init()
		{
			rng = new Random(1337);
			data = new byte[128 * 1024]; // 128K
			rng.NextBytes(data);

			dbgAll = CreateBS(data);
		}

		[TearDown]
		public void Dispose()
		{
			rng = null;
			data = null;
			dbgAll.Dispose();
		}

		[Test]
		public void TestReadInt()
		{
			int bitOffset = 0;
			int totalBits = data.Length * 8;

			while (bitOffset < totalBits) {
				int thisTime = Math.Min(rng.Next(32) + 1, totalBits - bitOffset);
				dbgAll.ReadInt(thisTime);
				bitOffset += thisTime;
			}
		}

		[Test]
		public void TestReadSignedInt()
		{
			int bitOffset = 0;
			int totalBits = data.Length * 8;

			while (bitOffset < totalBits) {
				int thisTime = Math.Min(rng.Next(32) + 1, totalBits - bitOffset);
				dbgAll.ReadSignedInt(thisTime);
				bitOffset += thisTime;
			}
		}

		[Test]
		public void TestReadByte()
		{
			int bitOffset = 0;
			int totalBits = data.Length * 8;

			while (bitOffset < totalBits) {
				int thisTime = Math.Min(rng.Next(8) + 1, totalBits - bitOffset);
				dbgAll.ReadByte(thisTime);
				bitOffset += thisTime;
			}
		}

		[Test]
		public void TestReadBytes()
		{
			int offset = 0;
			while (offset < data.Length) {
				int thisTime = rng.Next(data.Length - offset) + 1;
				dbgAll.ReadBytes(thisTime);
				offset += thisTime;
			}
		}

		[Test]
		public void TestReadBits()
		{
			int bitOffset = 0;
			int totalBits = data.Length * 8;

			while (bitOffset < totalBits) {
				int thisTime = Math.Min(rng.Next(512) + 1, totalBits - bitOffset);
				dbgAll.ReadBits(thisTime);
				bitOffset += thisTime;
			}
		}

		[Test]
		public void TestVarintDecodingPositive()
		{
			Assert.AreEqual(0, CreateBS(new byte[] { 0 }).ReadProtobufVarInt());
			Assert.AreEqual(1, CreateBS(new byte[] { 1 }).ReadProtobufVarInt());
			Assert.AreEqual(150, CreateBS(new byte[] { 0x96, 0x01 }).ReadProtobufVarInt());
			Assert.AreEqual(300, CreateBS(new byte[] { 172, 2 }).ReadProtobufVarInt());
			Assert.AreEqual(200000000, CreateBS(new byte[] { 0x80, 0x84, 0xaf, 0x5f }).ReadProtobufVarInt());
			Assert.AreEqual(2000000000, CreateBS(new byte[] { 0x80, 0xa8, 0xd6, 0xb9, 7 }).ReadProtobufVarInt());
		}

		[Test]
		public void TestVarintDecodingNegative()
		{
			Assert.AreEqual(-1, CreateBS(new byte[] { 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 1 }).ReadProtobufVarInt());
			Assert.AreEqual(-200000000, CreateBS(new byte[] { 0x80, 0xfc, 0xd0, 0xa0, 0xff, 0xff, 0xff, 0xff, 0xff, 1 }).ReadProtobufVarInt());
			Assert.AreEqual(-2000000000, CreateBS(new byte[] { 0x80, 0xd8, 0xa9, 0xc6, 0xf8, 0xff, 0xff, 0xff, 0xff, 1 }).ReadProtobufVarInt());
		}

		[Test]
		public void TestBasicChunking()
		{
			Assert.AreEqual(data.First(), dbgAll.ReadByte());
			dbgAll.BeginChunk((128 * 1024 - 2) * 8);
			Assert.IsFalse(dbgAll.ChunkFinished);
			dbgAll.ReadBytes(128 * 1024 - 2);
			Assert.IsTrue(dbgAll.ChunkFinished);
			dbgAll.EndChunk();
			Assert.AreEqual(data.Last(), dbgAll.ReadByte());
		}

		[Test]
		public void TestChunkSkippingSmall()
		{
			dbgAll.BeginChunk(1);
			Assert.IsFalse(dbgAll.ChunkFinished);
			dbgAll.EndChunk();
			dbgAll.ReadByte();
		}

		[Test]
		public void TestChunkSkippingPartial()
		{
			dbgAll.BeginChunk(2);
			Assert.IsFalse(dbgAll.ChunkFinished);
			dbgAll.ReadByte(1);
			Assert.IsFalse(dbgAll.ChunkFinished);
			dbgAll.EndChunk();
			dbgAll.ReadByte();
		}

		[Test]
		public void TestChunkSkippingLarge()
		{
			dbgAll.BeginChunk(4097 * 8);
			Assert.IsFalse(dbgAll.ChunkFinished);
			dbgAll.EndChunk();
			dbgAll.ReadByte();

			dbgAll.BeginChunk(4096 * 8);
			dbgAll.ReadByte();
			Assert.IsFalse(dbgAll.ChunkFinished);
			dbgAll.EndChunk();
			dbgAll.ReadByte();
		}

		[Test]
		public void TestChunkSkippingLargePartial()
		{
			dbgAll.BeginChunk(8193 * 8);
			Assert.IsFalse(dbgAll.ChunkFinished);
			dbgAll.ReadBytes(4097);
			dbgAll.EndChunk();
			dbgAll.ReadByte();
		}

		[Test]
		public void TestChunkSkippingRandom()
		{
			int bitOffset = 0;
			int totalBits = data.Length * 8;

			while (bitOffset < totalBits - 16) {
				int thisTime = Math.Min(rng.Next(4096) + 16, totalBits - bitOffset - 8);
				dbgAll.BeginChunk(thisTime);
				dbgAll.ReadByte();
				dbgAll.EndChunk();
				dbgAll.ReadByte();
				bitOffset += thisTime + 8;
			}
		}

		[Test]
		public void TestChunkSkippingRandomExhaustive()
		{
			try {
				TestChunkSkippingRandom();
			} catch (Exception) {
				Assert.Inconclusive("Go fix TestChunkSkippingRandom()! I'll wait here for you!");
			}

			try { dbgAll.ReadBit(); }
			catch (Exception) {
				// everything fine
				return;
			}
			Assert.Fail("Should have thrown");
		}

		[Test]
		public void TestChunkNesting()
		{
			dbgAll.BeginChunk(3);
			Assert.IsFalse(dbgAll.ChunkFinished);
			dbgAll.ReadBit();
			Assert.IsFalse(dbgAll.ChunkFinished);
			dbgAll.BeginChunk(1);
			Assert.IsFalse(dbgAll.ChunkFinished);
			dbgAll.EndChunk();
			Assert.IsFalse(dbgAll.ChunkFinished);
			dbgAll.ReadBit();
			Assert.IsTrue(dbgAll.ChunkFinished);
			dbgAll.EndChunk();
		}

		[Test]
		public void TestChunkNestingComplex()
		{
			dbgAll.BeginChunk(5);
			Assert.IsFalse(dbgAll.ChunkFinished);
			dbgAll.BeginChunk(1);
			Assert.IsFalse(dbgAll.ChunkFinished);
			dbgAll.EndChunk();
			Assert.IsFalse(dbgAll.ChunkFinished);
			dbgAll.BeginChunk(4);
			Assert.IsFalse(dbgAll.ChunkFinished);
			dbgAll.BeginChunk(1);
			Assert.IsFalse(dbgAll.ChunkFinished);
			dbgAll.EndChunk();
			Assert.IsFalse(dbgAll.ChunkFinished);
			dbgAll.BeginChunk(3);
			Assert.IsFalse(dbgAll.ChunkFinished);
			dbgAll.BeginChunk(1);
			Assert.IsFalse(dbgAll.ChunkFinished);
			dbgAll.EndChunk();
			Assert.IsFalse(dbgAll.ChunkFinished);
			dbgAll.BeginChunk(2);
			Assert.IsFalse(dbgAll.ChunkFinished);
			dbgAll.BeginChunk(1);
			Assert.IsFalse(dbgAll.ChunkFinished);
			dbgAll.EndChunk();
			Assert.IsFalse(dbgAll.ChunkFinished);
			dbgAll.BeginChunk(1);
			Assert.IsFalse(dbgAll.ChunkFinished);
			dbgAll.BeginChunk(1);
			Assert.IsFalse(dbgAll.ChunkFinished);
			dbgAll.EndChunk();

			Assert.IsTrue(dbgAll.ChunkFinished);
			dbgAll.EndChunk();
			Assert.IsTrue(dbgAll.ChunkFinished);
			dbgAll.EndChunk();
			Assert.IsTrue(dbgAll.ChunkFinished);
			dbgAll.EndChunk();
			Assert.IsTrue(dbgAll.ChunkFinished);
			dbgAll.EndChunk();
			Assert.IsTrue(dbgAll.ChunkFinished);
			dbgAll.EndChunk();
		}

		[Test]
		public void TestChunkNestingCompletely()
		{
			dbgAll.BeginChunk(8192 * 8);
			dbgAll.BeginChunk(4096 * 8);
			dbgAll.BeginChunk(4096 * 8);
			Assert.IsFalse(dbgAll.ChunkFinished);
			dbgAll.EndChunk();
			Assert.IsTrue(dbgAll.ChunkFinished);
			dbgAll.EndChunk();
			dbgAll.ReadBytes(4096);
			dbgAll.EndChunk();
			dbgAll.ReadBytes(4096);
		}

		[Test]
		public void TestChunkNestingRandom()
		{
			Stack<int> remainingStack = new Stack<int>();
			int depth = 0, remaining = data.Length * 8 - 1;
			dbgAll.BeginChunk(remaining);

			while ((remainingStack.Count > 0) || (remaining > 0)) {
				switch (rng.Next(2 + ((remainingStack.Count > 0) ? 1 : 0))) {
				case 0: // begin new chunk
					int chunksize = Math.Min(rng.Next(5000 * 8), remaining);
					Console.WriteLine("BeginChunk({0})", chunksize);
					dbgAll.BeginChunk(chunksize);
					remainingStack.Push(remaining - chunksize);
					remaining = chunksize;
					break;
				case 1: // read stuff
					int blocksize = Math.Min(rng.Next(5000 * 8), remaining);
					Console.WriteLine("ReadBits({0})", blocksize);
					dbgAll.ReadBits(blocksize);
					remaining -= blocksize;
					break;
				case 2: // end current chunk
					dbgAll.EndChunk();
					remaining = remainingStack.Pop();
					Console.WriteLine("EndChunk(); remaining={0}", remaining);
					break;
				default:
					throw new NotImplementedException();
				}
			}
			// tear down current depth
			for (int i = 0; i < depth; i++)
				dbgAll.EndChunk();

			dbgAll.EndChunk();
			dbgAll.ReadBit();
		}

		[Test]
		public void TestChunkNestingRandomExhaustive()
		{
			try {
				TestChunkNestingRandom();
			} catch (Exception) {
				Assert.Inconclusive("Go fix TestChunkNestingRandom()! I'll wait here for you!");
			}

			try { dbgAll.ReadBit(); }
			catch (Exception) {
				// everything all right
				return;
			}
			Assert.Fail("Should have thrown");
		}
	}
}

