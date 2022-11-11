using System;

namespace Services.Exceptions.Voice
{
    public class InvalidArgsException : Exception
    {
        public InvalidArgsException() : base("Invalid arguments")
        {
        }
    }
}
