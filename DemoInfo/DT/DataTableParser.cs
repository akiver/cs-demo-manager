using DemoInfo.Messages;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DemoInfo.DT
{
    class DataTableParser
    {
        public DataTableParser()
        {

        }

        public int ClassBits
        {
            get { return (int)Math.Ceiling(Math.Log(ServerClasses.Count, 2)); } 
        }


        public List<SendTable> DataTables = new List<SendTable>();
        public List<ServerClass> ServerClasses = new List<ServerClass>();
        List<ExcludeEntry> CurrentExcludes = new List<ExcludeEntry>();

		public void ParsePacket(Stream stream)
        {
			BinaryReader reader = new BinaryReader(stream);

            while (true)
            {
                var type = (SVC_Messages)reader.ReadVarInt32();
                if (type != SVC_Messages.svc_SendTable)
                    throw new Exception("Expected SendTable, got " + type);


                var sendTable = reader.ReadProtobufMessage<CSVCMsg_SendTable>();

                if (sendTable.is_end)
                    break;

                DataTables.Add(new SendTable(sendTable));
            }

            int serverClassCount = reader.ReadInt16();

            for (int i = 0; i < serverClassCount; i++)
            {
                ServerClass entry = new ServerClass();
                entry.ClassID = reader.ReadInt16();

                if (entry.ClassID > serverClassCount)
                    throw new Exception("Invalid class index");

                entry.Name = reader.ReadNullTerminatedString();
                entry.DTName = reader.ReadNullTerminatedString();

                entry.DataTableID = DataTables.FindIndex(a => a.Name == entry.DTName);

                ServerClasses.Add(entry);
            }

            for (int i = 0; i < serverClassCount; i++)
                FlattenDataTable(i);
        }

        void FlattenDataTable(int serverClassIndex)
        {
            SendTable table = DataTables[ServerClasses[serverClassIndex].DataTableID];
            CurrentExcludes.Clear();

            GatherExcludes(table);

            GatherProps(table, serverClassIndex);

            var flattenedProps = ServerClasses[serverClassIndex].flattenedProps;

            List<int> priorities = new List<int>();
            priorities.Add(64);
            priorities.AddRange(flattenedProps.Select(a => a.Prop.Priority).Distinct());
            priorities.Sort();

            int start = 0;
            for (int priorityIndex = 0; priorityIndex < priorities.Count; priorityIndex++)
            {
                int priority = priorities[priorityIndex];

                while (true)
                {
                    int currentProp = start;

                    while (currentProp < flattenedProps.Count)
                    {
                        SendTableProperty prop = flattenedProps[currentProp].Prop;

                        if (prop.Priority == priority || (priority == 64 && prop.Flags.HasFlagFast(SendPropertyFlags.ChangesOften)))
                        {
                            if (start != currentProp)
                            {
                                FlattenedPropEntry temp = flattenedProps[start];
                                flattenedProps[start] = flattenedProps[currentProp];
                                flattenedProps[currentProp] = temp;
                            }

                            start++;
                            break;
                        }
                        currentProp++;
                    }

                    if (currentProp == flattenedProps.Count)
                        break;
                }


            }

        }

        void GatherExcludes(SendTable sendTable)
        {
            CurrentExcludes.AddRange(
                sendTable.Properties
                    .Where(a => a.Flags.HasFlagFast(SendPropertyFlags.Exclude))
                    .Select(a => new ExcludeEntry(a.Name, a.DataTableName, sendTable.Name))
                );

            foreach (var prop in sendTable.Properties.Where(a => a.Type == SendPropertyType.DataTable))
            {
                GatherExcludes(GetTableByName(prop.DataTableName));
            }
        }

        void GatherProps(SendTable table, int serverClassIndex)
        {
            List<FlattenedPropEntry> tmpFlattenedProps = new List<FlattenedPropEntry>();
            GatherProps_IterateProps(table, serverClassIndex, tmpFlattenedProps);

            List<FlattenedPropEntry> flattenedProps = ServerClasses[serverClassIndex].flattenedProps;

            flattenedProps.AddRange(tmpFlattenedProps);
        }

        void GatherProps_IterateProps(SendTable table, int ServerClassIndex, List<FlattenedPropEntry> flattenedProps)
        {
            for (int i = 0; i < table.Properties.Count; i++)
            {
                SendTableProperty property = table.Properties[i];

                if (property.Flags.HasFlagFast(SendPropertyFlags.InsideArray) || property.Flags.HasFlagFast(SendPropertyFlags.Exclude) || IsPropExcluded(table, property))
                    continue;

                if (property.Type == SendPropertyType.DataTable)
                {
                    SendTable subTable = GetTableByName(property.DataTableName);

                    if (property.Flags.HasFlagFast(SendPropertyFlags.Collapsible))
                    {
                        GatherProps_IterateProps(subTable, ServerClassIndex, flattenedProps);
                    }
                    else
                    {
                        GatherProps(subTable, ServerClassIndex);
                    }
                }
                else
                {
                    if (property.Type == SendPropertyType.Array)
                    {
                        flattenedProps.Add(new FlattenedPropEntry(property, table.Properties[i - 1]));
                    }
                    else
                    {
                        flattenedProps.Add(new FlattenedPropEntry(property, null));
                    }
                }


            }
        }

        bool IsPropExcluded(SendTable table, SendTableProperty prop)
        {
            return CurrentExcludes.Exists(a => table.Name == a.DTName && prop.Name == a.VarName);
        }

        SendTable GetTableByName(string pName)
        {
            return DataTables.FirstOrDefault(a => a.Name == pName);
        }
    }
}
