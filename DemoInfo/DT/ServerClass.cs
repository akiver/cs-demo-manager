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

		public override string ToString()
		{
			return Name + " | " + DTName;
		}
    }

	internal class FlattenedPropEntry
    {
	    public SendTableProperty Prop { get; private set; }
        public SendTableProperty ArrayElementProp { get; private set; }
		public string PropertyName { get; private set; }

		public FlattenedPropEntry(string propertyName, SendTableProperty prop, SendTableProperty arrayElementProp)
	    {
            this.Prop = prop;
            this.ArrayElementProp = arrayElementProp;
			this.PropertyName = propertyName;
	    }

		public override string ToString()
		{
			return string.Format("[FlattenedPropEntry: PropertyName={2}, Prop={0}, ArrayElementProp={1}]", Prop, ArrayElementProp, PropertyName);
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
