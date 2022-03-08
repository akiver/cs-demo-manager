using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Core.Models
{
    /// <summary>
    /// Contains basic demos data to retrieve quickly demos from cache
    /// </summary>
    public class DemoBasicData
    {
        [JsonProperty("id")] public string Id { get; set; }

        [JsonProperty("path")] public string Path { get; set; }

        [JsonProperty("date")] public DateTime Date { get; set; }

        [JsonProperty("steamids")] public List<long> SteamIdList { get; set; }

        public DemoBasicData()
        {
            SteamIdList = new List<long>();
        }

        public override bool Equals(object obj)
        {
            var item = obj as DemoBasicData;

            return item != null && Id.Equals(item.Id);
        }

        public override int GetHashCode()
        {
            return base.GetHashCode();
        }
    }
}
