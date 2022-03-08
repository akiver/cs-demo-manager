using System.Windows.Controls.Primitives;

namespace Manager.Internals.MultiSelect
{
    public interface IMultiSelectCollectionView
    {
        void AddControl(Selector selector);
        void RemoveControl(Selector selector);
    }
}
