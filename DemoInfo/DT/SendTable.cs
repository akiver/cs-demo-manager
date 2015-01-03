using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;

namespace DemoInfo.DT
{
	class SendTable
	{
        List<SendTableProperty> properties = new List<SendTableProperty>();
        public List<SendTableProperty> Properties
        {
            get { return properties; }
        }

		public string Name { get; set; }
		public bool IsEnd { get; set; }

		public SendTable(IBitStream bitstream) {
			DemoInfo.SendTable dataTable = new DemoInfo.SendTable();

			foreach (var prop in dataTable.Parse(bitstream)) {
				SendTableProperty property = new SendTableProperty () {
					DataTableName = prop.DtName,
					HighValue = prop.HighValue,
					LowValue = prop.LowValue,
					Name = prop.VarName,
					NumberOfBits = prop.NumBits,
					NumberOfElements = prop.NumElements,
					Priority = prop.Priority,
					RawFlags = prop.Flags,
					RawType = prop.Type
				};

				properties.Add (property);
			}

			this.Name = dataTable.NetTableName;
			this.IsEnd = dataTable.IsEnd;
		}
	}
}

