using System;

namespace Services.Exceptions.Launcher
{
    public class KillCsgoException : Exception
    {
        public KillCsgoException(Exception innerException) : base("Failed to kill CSGO process", innerException)
        {
        }
    }
}
