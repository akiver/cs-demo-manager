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

		public SendTable (Messages.CSVCMsg_SendTable dataTable)
		{
			Parse (dataTable);
		}

		private void Parse (Messages.CSVCMsg_SendTable dataTable)
		{
            this.Name = dataTable.net_table_name;

			foreach (var prop in dataTable.props) {
				SendTableProperty property = new SendTableProperty () {
					DataTableName = prop.dt_name,
					HighValue = prop.high_value,
					LowValue = prop.low_value,
					Name = prop.var_name,
					NumberOfBits = prop.num_bits,
					NumberOfElements = prop.num_elements,
					Priority = prop.priority,
					RawFlags = prop.flags,
					RawType = prop.type
				};

				properties.Add (property);
			}
		}
	}


}

