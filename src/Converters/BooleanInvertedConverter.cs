namespace CSGO_Demos_Manager.Converters
{
	public class BooleanInvertedConverter : BooleanConverter<bool>
	{
		public BooleanInvertedConverter() :
				base(false, true)
		{
		}
	}
}