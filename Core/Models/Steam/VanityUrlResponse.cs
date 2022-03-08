using Newtonsoft.Json;

namespace Core.Models.Steam
{
    public class VanityUrlResponse
    {
        [JsonProperty("response")] public VanityUrlContent Response { get; set; }
    }

    public class VanityUrlContent
    {
        [JsonProperty("steamid")] public string SteamId { get; set; }

        [JsonProperty("success")] public int Success { get; set; }
    }
}
