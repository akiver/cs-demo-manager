namespace CSGO_Demos_Manager.Converters
{
	class BooleanToStringConverter : BooleanConverter<string>
	{
		public BooleanToStringConverter() :
				base("Yes", "No")
		{
		}
	}
}
