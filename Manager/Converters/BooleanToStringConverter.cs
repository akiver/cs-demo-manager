namespace Manager.Converters
{
	class BooleanToStringConverter : BooleanConverter<string>
	{
		public BooleanToStringConverter() :
				base(Properties.Resources.Yes, Properties.Resources.No)
		{
		}
	}
}
