using System;
using Newtonsoft.Json;

namespace Core.Models
{
    /// <summary>
    /// Used to retrieve user's accounts last rank detected
    /// </summary>
    public class RankInfo
    {
        [JsonProperty("steamid")] public long SteamId { get; set; }

        [JsonProperty("number")] public int Number { get; set; }

        [JsonProperty("date")] public DateTime LastDate { get; set; }
    }
}
