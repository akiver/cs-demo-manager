using System;
using System.IO;
using System.Security.Cryptography;

namespace Services
{
    internal static class Hash
    {
        public static string GetSha1HashFile(string filePath)
        {
            using (FileStream stream = File.OpenRead(filePath))
            {
                SHA1Managed sha = new SHA1Managed();
                byte[] hash = sha.ComputeHash(stream);
                return BitConverter.ToString(hash).Replace("-", string.Empty);
            }
        }
    }
}
