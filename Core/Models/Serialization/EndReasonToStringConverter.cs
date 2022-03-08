using System;
using DemoInfo;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Core.Models.Serialization
{
    public class EndReasonToStringConverter : JsonConverter
    {
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            string reasonAsString;
            RoundEndReason reason = (RoundEndReason)value;
            switch (reason)
            {
                case RoundEndReason.CTWin:
                    reasonAsString = AppSettings.CT_WIN;
                    break;
                case RoundEndReason.TerroristWin:
                    reasonAsString = AppSettings.T_WIN;
                    break;
                case RoundEndReason.TargetBombed:
                    reasonAsString = AppSettings.BOMB_EXPLODED;
                    break;
                case RoundEndReason.BombDefused:
                    reasonAsString = AppSettings.BOMB_DEFUSED;
                    break;
                case RoundEndReason.CTSurrender:
                    reasonAsString = AppSettings.CT_SURRENDER;
                    break;
                case RoundEndReason.TerroristsSurrender:
                    reasonAsString = AppSettings.T_SURRENDER;
                    break;
                case RoundEndReason.TargetSaved:
                    reasonAsString = AppSettings.TARGET_SAVED;
                    break;
                default:
                    reasonAsString = AppSettings.UNKNOWN;
                    break;
            }

            serializer.Serialize(writer, reasonAsString);
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            JToken jt = JToken.ReadFrom(reader);
            switch ((string)jt)
            {
                case AppSettings.CT_WIN:
                    return RoundEndReason.CTWin;
                case AppSettings.T_WIN:
                    return RoundEndReason.TerroristWin;
                case AppSettings.BOMB_EXPLODED:
                    return RoundEndReason.TargetBombed;
                case AppSettings.BOMB_DEFUSED:
                    return RoundEndReason.BombDefused;
                case AppSettings.CT_SURRENDER:
                    return RoundEndReason.CTSurrender;
                case AppSettings.T_SURRENDER:
                    return RoundEndReason.TerroristsSurrender;
                case AppSettings.TARGET_SAVED:
                    return RoundEndReason.TargetSaved;
                default:
                    return RoundEndReason.Draw;
            }
        }

        public override bool CanConvert(Type objectType)
        {
            return typeof(RoundEndReason) == objectType;
        }
    }
}
