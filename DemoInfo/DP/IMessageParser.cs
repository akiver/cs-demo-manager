using ProtoBuf;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DemoInfo.DP
{
	/// <summary>
	/// A generic *singleton* object that can parse messages.
	/// </summary>
    public interface IMessageParser
    {
		/// <summary>
		/// Determines whether this instance can handle the specified message.
		/// </summary>
		/// <returns><c>true</c> if this instance can handle the specified message; otherwise, <c>false</c>.</returns>
		/// <param name="message">Message.</param>
        bool CanHandleMessage(IExtensible message);

		/// <summary>
		/// Parses a given protobuf message.
		/// </summary>
		/// <param name="message">The protobuf Message.</param>
		/// <param name="parser">The <see cref="DemoParser"/> that holds the parsing context.</param>
        void ApplyMessage(IExtensible message, DemoParser parser);

		/// <summary>
		/// Gets this parser's priority.
		/// </summary>
		/// <remarks>
		/// Parsers with a higher priority will run first.
		/// Parsers with a priority > 0 will additionally prevent other parsers from receiving a message they parsed.
		/// </remarks>
		/// <returns>The priority.</returns>
        int GetPriority();
    }
}
