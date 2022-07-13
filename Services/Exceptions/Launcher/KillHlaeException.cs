using System;

namespace Services.Exceptions.Launcher
{
    public class KillHlaeException : Exception
    {
        public KillHlaeException(Exception innerException) : base("Failed to kill HLAE process", innerException)
        {
        }
    }
}
