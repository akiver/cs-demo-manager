using DemoInfo.Messages;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DemoInfo.DT
{
    class ServerClass
    {
        public int ClassID;
        public int DataTableID;
        public string Name;
        public string DTName;

        public List<FlattenedPropEntry> flattenedProps = new List<FlattenedPropEntry>();
    }

    public class FlattenedPropEntry
    {
	    public SendTableProperty Prop { get; private set; }
        public SendTableProperty ArrayElementProp { get; private set; }

        public FlattenedPropEntry(SendTableProperty prop, SendTableProperty arrayElementProp)
	    {
            this.Prop = prop;
            this.ArrayElementProp = arrayElementProp;
	    }

    };

    class ExcludeEntry
    {
	    public ExcludeEntry( string varName, string dtName, string excludingDT )
	    {
            VarName = varName;
            DTName = dtName;
            ExcludingDT = excludingDT;
	    }

        public string VarName { get; private set; }
        public string DTName { get; private set; }
        public string ExcludingDT { get; private set; }
    }

}
