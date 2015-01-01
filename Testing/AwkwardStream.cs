using System;
using System.IO;

namespace Testing
{
	public class AwkwardStream : Stream
	{
		private readonly Stream Underlying;
		private readonly Random Rng;

		public AwkwardStream(Stream underlying, Random rng)
		{
			Underlying = underlying;
			Rng = rng;
		}

		public override int Read(byte[] buffer, int offset, int count)
		{
			// 50% of all reads will return 1-4 bytes.
			return Underlying.Read(buffer, offset, Rng.Next((Rng.Next(1) == 0) ? 4 : count) + 1);
		}

		#region Unsupported stuff
		public override void Flush()
		{
		}
		public override long Seek(long offset, SeekOrigin origin)
		{
			throw new NotSupportedException();
		}
		public override void SetLength(long value)
		{
			throw new NotSupportedException();
		}
		public override void Write(byte[] buffer, int offset, int count)
		{
			throw new NotSupportedException();
		}
		public override bool CanRead { get { return true; } }
		public override bool CanSeek { get { return false; } }
		public override bool CanWrite { get { return false; } }
		public override long Length {
			get {
				throw new NotSupportedException();
			}
		}
		public override long Position {
			get {
				throw new NotSupportedException();
			}
			set {
				throw new NotSupportedException();
			}
		}
		#endregion
	}
}

