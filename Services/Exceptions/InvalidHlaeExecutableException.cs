using System;

namespace Services.Exceptions
{
    public class InvalidHlaeExecutableException : Exception
    {
        public InvalidHlaeExecutableException() : base("Invalid HLAE executable")
        {
        }
    }
}
