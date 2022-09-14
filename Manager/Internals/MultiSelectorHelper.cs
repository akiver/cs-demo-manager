using System.Collections;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Windows.Controls.Primitives;
using System.Windows.Controls;
using System.Windows;
using System;

namespace Manager.Internals
{
    /// <summary>
    /// Because it's still not possible to have a 2 way binding on "SelectedItems" and the MahApps helper may add duplicates in existing selections after navigation.
    /// https://github.com/dotnet/wpf/issues/3140
    /// https://github.com/MahApps/MahApps.Metro/issues/4245
    /// Defines a helper class for SelectedItems binding on <see cref="ListBox"/>, <see cref="MultiSelector"/> or <see cref="MultiSelectionComboBox"/> controls.
    /// </summary>
    public static class MultiSelectorHelper
    {
        public static readonly DependencyProperty SelectedItemsProperty
            = DependencyProperty.RegisterAttached(
                "SelectedItems",
                typeof(IList),
                typeof(MultiSelectorHelper),
                new FrameworkPropertyMetadata(null, OnSelectedItemsChanged));

        /// <summary>
        /// Handles disposal and creation of old and new bindings
        /// </summary>
        private static void OnSelectedItemsChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (!(d is ListBox || d is MultiSelector))
            {
                throw new ArgumentException("The property 'SelectedItems' may only be set on ListBox or MultiSelector elements.");
            }

            if (e.OldValue != e.NewValue)
            {
                GetSelectedItemBinding(d)?.UnBind();

                if (e.NewValue is IList newList)
                {
                    var multiSelectorBinding = new MultiSelectorBinding((Selector)d, newList);
                    SetSelectedItemBinding(d, multiSelectorBinding);
                    multiSelectorBinding.Bind();
                }
                else
                {
                    SetSelectedItemBinding(d, null);
                }
            }
        }

        /// <summary>
        /// Gets the selected items property binding
        /// </summary>
        [AttachedPropertyBrowsableForType(typeof(ListBox))]
        [AttachedPropertyBrowsableForType(typeof(MultiSelector))]
        public static IList GetSelectedItems(DependencyObject element)
        {
            return (IList)element.GetValue(SelectedItemsProperty);
        }

        /// <summary>
        /// Sets the selected items property binding
        /// </summary>
        [AttachedPropertyBrowsableForType(typeof(ListBox))]
        [AttachedPropertyBrowsableForType(typeof(MultiSelector))]
        public static void SetSelectedItems(DependencyObject element, IList value)
        {
            element.SetValue(SelectedItemsProperty, value);
        }

        private static readonly DependencyProperty SelectedItemBindingProperty
            = DependencyProperty.RegisterAttached(
                "SelectedItemBinding",
                typeof(MultiSelectorBinding),
                typeof(MultiSelectorHelper));

        private static MultiSelectorBinding GetSelectedItemBinding(DependencyObject element)
        {
            return (MultiSelectorBinding)element.GetValue(SelectedItemBindingProperty);
        }

        private static void SetSelectedItemBinding(DependencyObject element, MultiSelectorBinding value)
        {
            element.SetValue(SelectedItemBindingProperty, value);
        }

        /// <summary>
        /// Defines a binding between <see cref="Selector"/> and collection.
        /// </summary>
        private class MultiSelectorBinding
        {
            private readonly Selector selector;
            private readonly IList collection;

            /// <summary>
            /// Creates an instance of <see cref="MultiSelectorBinding"/>
            /// </summary>
            /// <param name="selector">The selector of this binding</param>
            /// <param name="collection">The bound collection</param>
            public MultiSelectorBinding(Selector selector, IList collection)
            {
                this.selector = selector;
                this.collection = collection;

                var selectedItems = GetSelectedItems(selector);
                if (selectedItems != null)
                {
                    selectedItems.Clear();
                    foreach (var newItem in collection)
                    {
                        selectedItems.Add(newItem);
                    }
                }
            }

            /// <summary>
            /// Registers the event handlers for selector and collection changes
            /// </summary>
            public void Bind()
            {
                // prevent multiple event registration
                this.UnBind();

                this.selector.SelectionChanged += this.OnSelectionChanged;
                if (this.collection is INotifyCollectionChanged notifyCollection)
                {
                    notifyCollection.CollectionChanged += this.OnCollectionChanged;
                }
            }

            /// <summary>
            /// Clear the event handlers for selector and collection changes
            /// </summary>
            public void UnBind()
            {
                this.selector.SelectionChanged -= this.OnSelectionChanged;
                if (this.collection is INotifyCollectionChanged notifyCollection)
                {
                    notifyCollection.CollectionChanged -= this.OnCollectionChanged;
                }
            }

            /// <summary>
            /// Updates the collection with changes made in the selector
            /// </summary>
            private void OnSelectionChanged(object sender, SelectionChangedEventArgs e)
            {
                var notifyCollection = this.collection as INotifyCollectionChanged;
                if (notifyCollection != null)
                {
                    notifyCollection.CollectionChanged -= this.OnCollectionChanged;
                }

                try
                {
                    var removedItems = e.RemovedItems;
                    if (removedItems != null)
                    {
                        foreach (var oldItem in removedItems)
                        {
                            this.collection.Remove(oldItem);
                        }
                    }

                    var addedItems = e.AddedItems;
                    if (addedItems != null)
                    {
                        foreach (var newItem in addedItems)
                        {
                            if (!this.collection.Contains(newItem))
                            {
                                this.collection.Add(newItem);
                            }
                        }
                    }
                }
                finally
                {
                    if (notifyCollection != null)
                    {
                        notifyCollection.CollectionChanged += this.OnCollectionChanged;
                    }
                }
            }

            /// <summary>
            /// Updates the selector with changes made in the collection
            /// </summary>
            private void OnCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
            {
                this.selector.SelectionChanged -= this.OnSelectionChanged;

                try
                {
                    var selectedItems = GetSelectedItems(this.selector);
                    if (selectedItems != null)
                    {
                        switch (e.Action)
                        {
                            case NotifyCollectionChangedAction.Add:
                                if (e.NewItems != null)
                                {
                                    foreach (var item in e.NewItems)
                                    {
                                        selectedItems.Add(item);
                                    }
                                }

                                break;
                            case NotifyCollectionChangedAction.Remove:
                                if (e.OldItems != null)
                                {
                                    foreach (var item in e.OldItems)
                                    {
                                        selectedItems.Remove(item);
                                    }
                                }

                                break;
                            case NotifyCollectionChangedAction.Move:
                                Move(selectedItems, e);
                                break;
                            case NotifyCollectionChangedAction.Replace:
                                RemoveItems(selectedItems, e);
                                AddItems(selectedItems, e);
                                break;
                            case NotifyCollectionChangedAction.Reset:
                                selectedItems.Clear();
                                break;
                        }
                    }
                }
                finally
                {
                    this.selector.SelectionChanged += this.OnSelectionChanged;
                }
            }

            private static void RemoveItems(IList selectedItems, NotifyCollectionChangedEventArgs e)
            {
                if (e.OldItems != null && selectedItems != null)
                {
                    foreach (var item in e.OldItems)
                    {
                        selectedItems.Remove(item);
                    }
                }
            }

            private static void AddItems(IList selectedItems, NotifyCollectionChangedEventArgs e)
            {
                if (e.NewItems != null && selectedItems != null)
                {
                    for (var i = 0; i < e.NewItems.Count; i++)
                    {
                        var insertionPoint = e.NewStartingIndex + i;

                        if (insertionPoint > selectedItems.Count)
                        {
                            selectedItems.Add(e.NewItems[i]);
                        }
                        else
                        {
                            selectedItems.Insert(insertionPoint, e.NewItems[i]);
                        }
                    }
                }
            }

            /// <summary>
            /// Checks if the given collection is a ObservableCollection&lt;&gt;
            /// </summary>
            /// <param name="collection">The collection to test.</param>
            /// <returns>True if the collection is a ObservableCollection&lt;&gt;</returns>
            private static bool IsObservableCollection(IList collection)
            {
                return collection != null
                       && collection.GetType().IsGenericType
                       && collection.GetType().GetGenericTypeDefinition() == typeof(ObservableCollection<>);
            }

            private static void Move(IList selectedItems, NotifyCollectionChangedEventArgs e)
            {
                if (selectedItems != null && e.OldStartingIndex != e.NewStartingIndex)
                {
                    if (selectedItems is ObservableCollection<object> observableCollection)
                    {
                        observableCollection.Move(e.OldStartingIndex, e.NewStartingIndex);
                    }
                    else if (IsObservableCollection(selectedItems))
                    {
                        var method = selectedItems.GetType().GetMethod("Move", System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.Public);
                        _ = method?.Invoke(selectedItems, new object[] { e.OldStartingIndex, e.NewStartingIndex });
                    }
                    else
                    {
                        RemoveItems(selectedItems, e);
                        AddItems(selectedItems, e);
                    }
                }
            }

            private static IList GetSelectedItems(Selector selector)
            {
                if (selector is MultiSelector multiSelector)
                {
                    return multiSelector.SelectedItems;
                }

                if (selector is ListBox listBox)
                {
                    return listBox.SelectedItems;
                }

                throw new InvalidOperationException("Target object has no SelectedItems property to bind.");
            }
        }
    }
}
