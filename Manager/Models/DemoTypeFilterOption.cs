using System.Collections.Generic;
using Core.Models;

namespace Manager.Models
{
    public class DemoTypeFilterOption
    {
        public string Value { get; set; }
        public string Label { get; set; }

        public DemoTypeFilterOption(string value, string label)
        {
            Value = value;
            Label = label;
        }

        public static readonly DemoTypeFilterOption AllFilterOption = new DemoTypeFilterOption("all", Properties.Resources.All);
        public static readonly DemoTypeFilterOption GotvFilterOption = new DemoTypeFilterOption(DemoType.GOTV.AsString(), Properties.Resources.DemoTypeGotv);
        public static readonly DemoTypeFilterOption PovFilterOption = new DemoTypeFilterOption(DemoType.POV.AsString(), Properties.Resources.DemoTypePov);

        public static List<DemoTypeFilterOption> Options = new List<DemoTypeFilterOption>
        {
            AllFilterOption,
            GotvFilterOption,
            PovFilterOption,
        };
    }
}
