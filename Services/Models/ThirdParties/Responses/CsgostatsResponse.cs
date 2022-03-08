using Newtonsoft.Json;

namespace Services.Models.ThirdParties.Responses
{
    public class Data
    {
        [JsonProperty("demo_id", NullValueHandling = NullValueHandling.Ignore)]
        public int DemoId { get; set; }

        [JsonProperty("url")] public string Url { get; set; }
    }

    public class CsgostatsResponse
    {
        [JsonProperty("status")] public string Status { get; set; }

        [JsonProperty("data")] public Data Data { get; set; }
    }
}
