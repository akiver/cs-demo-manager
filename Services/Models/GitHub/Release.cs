using System.Collections.Generic;
using Newtonsoft.Json;

namespace Services.Models.GitHub
{
    public class Asset
    {
        [JsonProperty("browser_download_url")] public string BrowserDownloadUrl { get; set; }
    }

    public class Release
    {
        [JsonProperty("tag_name")] public string TagName { get; set; }

        [JsonProperty("assets")] public List<Asset> Assets { get; set; }

        [JsonProperty("prerelease")] public bool PreRelease { get; set; }
    }
}
