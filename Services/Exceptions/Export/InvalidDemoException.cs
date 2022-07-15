using System;

namespace Services.Exceptions.Export
{
    public class InvalidDemoException : Exception
    {
        public InvalidDemoException() : base("Invalid demo file")
        {
        }
    }
}
