using System;

namespace Services.Exceptions.Map
{
    public class MapException : Exception
    {
        public MapException(string message)
            : base(message)
        {
        }
    }
}
