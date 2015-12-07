using System.Collections.Generic;
using CSGO_Demos_Manager.Models;

namespace CSGO_Demos_Manager.Services.Excel.Sheets
{
	public abstract class AbstractMultipleSheet : AbstractSheet
	{
		public List<Demo> Demos;
	}
}
