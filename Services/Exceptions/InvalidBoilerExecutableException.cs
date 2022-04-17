using System;

namespace Services.Exceptions
{
    public class InvalidBoilerExecutableException : Exception
    {
        public InvalidBoilerExecutableException() : base("Invalid boiler executable")
        {
        }
    }
}
