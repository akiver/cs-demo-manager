using DemoInfo.Messages;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DemoInfo.DP;

namespace DemoInfo.DT
{
	class ServerClass : IDisposable
    {
        public int ClassID;
        public int DataTableID;
        public string Name;
        public string DTName;

        public List<FlattenedPropEntry> FlattenedProps = new List<FlattenedPropEntry>();
		public List<ServerClass> BaseClasses = new List<ServerClass> ();


		public event EventHandler<EntityCreatedEventArgs> OnNewEntity; 

		internal void AnnounceNewEntity(Entity e)
		{
			if(OnNewEntity != null)
				OnNewEntity(this, new EntityCreatedEventArgs(this, e));
		}

		public event EventHandler<EntityDestroyedEventArgs> OnDestroyEntity;

		internal void AnnounceDestroyedEntity(Entity e)
		{
			if (OnDestroyEntity != null)
				OnDestroyEntity(this, new EntityDestroyedEventArgs(this, e));
		}

		public override string ToString()
		{
			return Name + " | " + DTName;
		}


		public void Dispose ()
		{
			this.OnNewEntity = null;
			this.OnDestroyEntity = null;
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
		

	class EntityCreatedEventArgs : EventArgs
	{
		public ServerClass Class { get; private set; }
		public Entity Entity { get; private set; }

		public EntityCreatedEventArgs(ServerClass c, Entity e)
		{
			this.Class = c;
			this.Entity = e;
		}
	}

	class EntityDestroyedEventArgs : EntityCreatedEventArgs
	{
		public EntityDestroyedEventArgs(ServerClass c, Entity e) : base(c, e)
		{

		}
	}
}
