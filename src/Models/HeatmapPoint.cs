namespace CSGO_Demos_Manager.Models
{
	public class HeatmapPoint
	{
		public float X { get; set; }

		public float Y { get; set; }

		public int Value { get; set; }

		public override bool Equals(object obj)
		{
			var item = (HeatmapPoint)obj;

			if (item == null)
			{
				return false;
			}

			return (X.Equals(item.X)) && (Y.Equals(item.Y));
		}

		public override int GetHashCode()
		{
			return base.GetHashCode();
		}

		public HeatmapPoint Clone()
		{
			return (HeatmapPoint)MemberwiseClone();
		}
	}
}
