using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Data;

namespace Manager.Internals.MultiSelect
{
	public sealed class MultiSelectCollectionView<T> : ListCollectionView, IMultiSelectCollectionView
	{
		private readonly List<Selector> _controls = new List<Selector>();

		public ObservableCollection<T> SelectedItems { get; }

		private bool _ignoreSelectionChanged;

		public MultiSelectCollectionView(IList list)
			: base(list)
		{
			SelectedItems = new ObservableCollection<T>();
		}

		void IMultiSelectCollectionView.AddControl(Selector selector)
		{
			_controls.Add(selector);
			SetSelection(selector);
			selector.SelectionChanged += control_SelectionChanged;
		}

		void IMultiSelectCollectionView.RemoveControl(Selector selector)
		{
			if (_controls.Remove(selector))
			{
				selector.SelectionChanged -= control_SelectionChanged;
			}
		}

		private void SetSelection(Selector selector)
		{
			MultiSelector multiSelector = selector as MultiSelector;
			ListBox listBox = selector as ListBox;

			if (multiSelector != null)
			{
				multiSelector.SelectedItems.Clear();

				foreach (T item in SelectedItems)
				{
					multiSelector.SelectedItems.Add(item);
				}
			}
			else if (listBox != null)
			{
				listBox.SelectedItems.Clear();

				foreach (T item in SelectedItems)
				{
					listBox.SelectedItems.Add(item);
				}
			}
		}

		private void control_SelectionChanged(object sender, SelectionChangedEventArgs e)
		{
			if (!_ignoreSelectionChanged)
			{
				bool changed = false;

				_ignoreSelectionChanged = true;

				try
				{
					foreach (T item in e.AddedItems)
					{
						if (!SelectedItems.Contains(item))
						{
							SelectedItems.Add(item);
							changed = true;
						}
					}

					foreach (T item in e.RemovedItems)
					{
						if (SelectedItems.Remove(item))
						{
							changed = true;
						}
					}

					if (changed)
					{
						foreach (Selector control in _controls)
						{
							if (!control.Equals(sender))
							{
								SetSelection(control);
							}
						}
					}
				}
				finally
				{
					_ignoreSelectionChanged = false;
				}
			}
		}

		public void DeselectAll()
		{
			_ignoreSelectionChanged = true;
			SelectedItems.Clear();
			foreach (Selector control in _controls)
			{
				SetSelection(control);
			}
			_ignoreSelectionChanged = false;
		}

		public void SelectAll()
		{
			_ignoreSelectionChanged = true;
			SelectedItems.Clear();
			foreach (T item in SourceCollection)
			{
				SelectedItems.Add(item);
			}

			foreach (Selector control in _controls)
			{
				SetSelection(control);
			}
			_ignoreSelectionChanged = false;
		}
	}
}
