using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace Core.Models.Serialization
{
    public class LongListToStringListConverter : JsonConverter
    {
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            List<long> longValues = value as List<long>;
            List<string> stringValues = new List<string>();
            if (longValues != null)
            {
                stringValues.AddRange(longValues.Select(v => v.ToString()));
            }

            serializer.Serialize(writer, stringValues);
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            var stringValues = serializer.Deserialize<List<string>>(reader);
            List<long> longValues = new List<long>();
            foreach (string v in stringValues)
            {
                longValues.Add(Convert.ToInt64(v));
            }

            return longValues;
        }

        public override bool CanConvert(Type objectType)
        {
            return typeof(List<long>) == objectType;
        }
    }
}
