namespace DemoInfo.DP.Handler
{
    public static class UpdateStringTableUserInfoHandler
    {
        public static void Apply(UpdateStringTable update, IBitStream reader, DemoParser parser)
        {
            CreateStringTable create = parser.stringTables[update.TableId];
            if (create.Name == "userinfo" || create.Name == "modelprecache" || create.Name == "instancebaseline")
            {
                /*
                 * Ignore updates for everything except the 3 used tables.
                 * Create a fake CreateStringTable message and parse it.
                 */
                create.NumEntries = update.NumChangedEntries;
                CreateStringTableUserInfoHandler.Apply(create, reader, parser);
            }
        }
    }
}
