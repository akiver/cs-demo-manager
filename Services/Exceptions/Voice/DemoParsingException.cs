using System;

namespace Services.Exceptions.Voice
{
    public class DemoParsingException : Exception
    {
        public DemoParsingException() : base("Failed to parse demo")
        {
        }
    }
}
