using System;

namespace Services.Exceptions.Voice
{
    public class DemoNotFoundException : Exception
    {
        public DemoNotFoundException() : base("Demo not found")
        {
        }
    }
}
