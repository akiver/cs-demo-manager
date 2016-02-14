using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;

namespace CSGO_Demos_Manager.Internals.MultiSelect
{
	public static class MultiSelect
	{
		static MultiSelect()
		{
			ItemsControl.ItemsSourceProperty.OverrideMetadata(typeof(Selector), new FrameworkPropertyMetadata(ItemsSourceChanged));
		}

		public static bool GetIsEnabled(Selector target)
		{
			return (bool)target.GetValue(IsEnabledProperty);
		}

		public static void SetIsEnabled(Selector target, bool value)
		{
			target.SetValue(IsEnabledProperty, value);
		}

		public static readonly DependencyProperty IsEnabledProperty =
			DependencyProperty.RegisterAttached("IsEnabled", typeof(bool), typeof(MultiSelect),
				new UIPropertyMetadata(IsEnabledChanged));

		private static void IsEnabledChanged(object sender, DependencyPropertyChangedEventArgs e)
		{
			Selector selector = sender as Selector;
			IMultiSelectCollectionView collectionView = selector?.ItemsSource as IMultiSelectCollectionView;

			if (selector != null && collectionView != null)
			{
				if ((bool)e.NewValue)
				{
					collectionView.AddControl(selector);
				}
				else
				{
					collectionView.RemoveControl(selector);
				}
			}
		}

		private static void ItemsSourceChanged(object sender, DependencyPropertyChangedEventArgs e)
		{
			Selector selector = sender as Selector;

			if (GetIsEnabled(selector))
			{
				IMultiSelectCollectionView oldCollectionView = e.OldValue as IMultiSelectCollectionView;
				IMultiSelectCollectionView newCollectionView = e.NewValue as IMultiSelectCollectionView;

				oldCollectionView?.RemoveControl(selector);
				newCollectionView?.AddControl(selector);
			}
		}
	}
}
