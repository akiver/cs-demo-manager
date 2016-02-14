using System.Windows.Controls.Primitives;

namespace CSGO_Demos_Manager.Internals.MultiSelect
{
	public interface IMultiSelectCollectionView
	{
		void AddControl(Selector selector);
		void RemoveControl(Selector selector);
	}
}
