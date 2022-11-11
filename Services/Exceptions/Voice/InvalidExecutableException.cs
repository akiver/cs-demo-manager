using System;

namespace Services.Exceptions.Voice
{
    public class InvalidExecutableException : Exception
    {
        public InvalidExecutableException() : base("Invalid executable")
        {
        }
    }
}
