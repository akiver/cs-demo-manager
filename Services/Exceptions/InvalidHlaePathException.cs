using System;

namespace Services.Exceptions
{
    public class InvalidHlaePathException : Exception
    {
        public InvalidHlaePathException() : base("Invalid HLAE path")
        {

        }
    }
}
