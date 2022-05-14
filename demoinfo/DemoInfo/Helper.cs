using System;
using System.IO;
using System.Linq;
using System.Text;
using DemoInfo.DT;
using DemoInfo.DP;

namespace DemoInfo
{
    internal static class Helper
    {
        public static string ReadCString(this BinaryReader reader, int length)
        {
            return ReadCString(reader, length, Encoding.UTF8);
        }

        public static int ReadInt32SwapEndian(this BinaryReader reader)
        {
            return BitConverter.ToInt32(reader.ReadBytes(4).Reverse().ToArray(), 0);
        }

        public static long ReadInt64SwapEndian(this BinaryReader reader)
        {
            return BitConverter.ToInt64(reader.ReadBytes(8).Reverse().ToArray(), 0);
        }

        public static string ReadCString(this BinaryReader reader, int length, Encoding encoding)
        {
            return encoding.GetString(reader.ReadBytes(length)).Split(new char[] { '\0' }, 2)[0];
        }

        public static bool HasFlagFast(this SendPropertyFlags flags, SendPropertyFlags check)
        {
            return (flags & check) == check;
        }

        public static RecordedPropertyUpdate<T> Record<T>(this PropertyUpdateEventArgs<T> args)
        {
            return new RecordedPropertyUpdate<T>(args.Property.Index, args.Value);
        }
    }
}
