using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DemoInfo.DP
{
	#if SLOW_PROTOBUF
	using ProtoBuf;

	/// <summary>
	/// A generic *singleton* object that can parse messages.
	/// </summary>
    public interface IMessageParser
    {
		/// <summary>
		/// Attempts to parse a given protobuf message.
		/// </summary>
		/// <returns><c>true</c> if this instance was able to handle the specified message; otherwise, <c>false</c>.</returns>
		/// <param name="message">The protobuf Message.</param>
		/// <param name="parser">The <see cref="DemoParser"/> that holds the parsing context.</param>
        bool TryApplyMessage(IExtensible message, DemoParser parser);

		/// <summary>
		/// Gets this parser's priority.
		/// </summary>
		/// <remarks>
		/// Parsers with a higher priority will run first.
		/// Parsers with a priority > 0 will additionally prevent other parsers from receiving a message they parsed.
		/// </remarks>
		/// <value>The priority.</value>
		int Priority { get; }
    }
	#endif
}
