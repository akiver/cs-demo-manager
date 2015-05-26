using CSGO_Demos_Manager.Models.Events;
using DemoInfo;

namespace CSGO_Demos_Manager.Models
{
	public class PositionPoint : MapPoint
	{
		public Round Round { get; set; }

		public int Color { get; set; }

		public Team Team { get; set; }

		public PlayerExtended Player { get; set; }

		public BaseEvent Event { get; set; }

		public override bool Equals(object obj)
		{
			if (obj.GetType() == typeof (PositionPoint))
			{
				var item = (PositionPoint)obj;

				return (X.Equals(item.X)) && (Y.Equals(item.Y) && Round.Equals(item.Round));
			}

			return false;
		}

		public override int GetHashCode()
		{
			return base.GetHashCode();
		}

		public PositionPoint Clone()
		{
			return (PositionPoint)MemberwiseClone();
		}
	}
}