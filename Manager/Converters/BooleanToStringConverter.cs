namespace Manager.Converters
{
	class BooleanToStringConverter : BooleanConverter<string>
	{
		public BooleanToStringConverter() :
				base("Yes", "No")
		{
		}
	}
}
