using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using GalaSoft.MvvmLight.Messaging;
using MahApps.Metro.Controls;
using Manager.Messages;

namespace Manager.Internals.MultiSelectComboBox
{
	public partial class MultiSelectComboBox : UserControl
	{
		private readonly ObservableCollection<Node> _nodeList = new ObservableCollection<Node>();

		public MultiSelectComboBox()
		{
			InitializeComponent();
		}

		#region Dependency Properties

		public static readonly DependencyProperty ItemsSourceProperty =
			DependencyProperty.Register("ItemsSource", typeof(Dictionary<string, object>), typeof(MultiSelectComboBox), new FrameworkPropertyMetadata(null, OnItemsSourceChanged));

		public static readonly DependencyProperty SelectedItemsProperty =
			DependencyProperty.Register("SelectedItems", typeof(Dictionary<string, object>), typeof(MultiSelectComboBox), new FrameworkPropertyMetadata(null, OnSelectedItemsChanged));

		public static readonly DependencyProperty TextProperty =
			DependencyProperty.Register("Text", typeof(string), typeof(MultiSelectComboBox), new UIPropertyMetadata(string.Empty));

		public static readonly DependencyProperty WatermarkProperty =
			DependencyProperty.RegisterAttached("Watermark", typeof(string), typeof(MultiSelectComboBox), new UIPropertyMetadata(string.Empty));

		public Dictionary<string, object> ItemsSource
		{
			get { return (Dictionary<string, object>)GetValue(ItemsSourceProperty); }
			set { SetValue(ItemsSourceProperty, value); }
		}

		public Dictionary<string, object> SelectedItems
		{
			get { return (Dictionary<string, object>)GetValue(SelectedItemsProperty); }
			set { SetValue(SelectedItemsProperty, value); }
		}

		public string Text
		{
			get { return (string)GetValue(TextProperty); }
			set { SetValue(TextProperty, value); }
		}

		public string Watermark
		{
			get { return (string)GetValue(WatermarkProperty); }
			set { SetValue(WatermarkProperty, value); }
		}

		#endregion

		#region Events

		private void UserControl_Loaded(object sender, RoutedEventArgs e)
		{
			TextBoxHelper.SetWatermark(MultiSelectCombo, (string)GetValue(WatermarkProperty));
			SelectNodes();
			SetText();
		}

		private void MultiSelectCombo_DropDownClosed(object sender, System.EventArgs e)
		{
			ComboBoxMultiClosedMessage msg = new ComboBoxMultiClosedMessage
			{
				SelectedItems = SelectedItems
			};
			Messenger.Default.Send(msg);
		}

		private static void OnItemsSourceChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
		{
			MultiSelectComboBox control = (MultiSelectComboBox)d;
			control.DisplayInControl();
		}

		private static void OnSelectedItemsChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
		{
			MultiSelectComboBox control = (MultiSelectComboBox)d;
			control.SelectNodes();
			control.SetText();
		}

		private void CheckBox_Click(object sender, RoutedEventArgs e)
		{
			CheckBox checkBox = (CheckBox)sender;

			if ((string)checkBox.Content == Properties.Resources.All)
			{
				if (checkBox.IsChecked != null && checkBox.IsChecked.Value)
				{
					foreach (Node node in _nodeList)
					{
						node.IsSelected = true;
					}
				}
				else
				{
					foreach (Node node in _nodeList)
					{
						node.IsSelected = false;
					}
				}
			}
			else
			{
				int selectedCount = _nodeList.Count(s => s.IsSelected && s.Key != "all");
				if (selectedCount == _nodeList.Count - 1)
				{
					Node nodeSelectAll = _nodeList.FirstOrDefault(i => i.Key == "all");
					if (nodeSelectAll != null) nodeSelectAll.IsSelected = true;
				}
				else
				{
					Node nodeSelectAll = _nodeList.FirstOrDefault(i => i.Key == "all");
					if (nodeSelectAll != null) nodeSelectAll.IsSelected = false;
				}
			}
			SetSelectedItems();
			SetText();
		}

		#endregion

		#region Methods

		private void SelectNodes()
		{
			foreach (KeyValuePair<string, object> keyValue in SelectedItems)
			{
				Node node = _nodeList.FirstOrDefault(i => i.Key == keyValue.Key);
				if (node != null) node.IsSelected = true;
			}
			// check the "All" checkbox if all items are selected
			if (SelectedItems.Count == ItemsSource.Count)
			{
				Node node = _nodeList.FirstOrDefault();
				if (node != null) node.IsSelected = true;
			}
		}

		private void SetSelectedItems()
		{
			if (SelectedItems == null) SelectedItems = new Dictionary<string, object>();
			SelectedItems.Clear();
			foreach (Node node in _nodeList)
			{
				if (node.IsSelected && node.Key != "all")
				{
					if (ItemsSource.Count > 0)
						SelectedItems.Add(node.Key, ItemsSource[node.Key]);
				}
			}
		}

		private void DisplayInControl()
		{
			_nodeList.Clear();

			if (ItemsSource.Count > 0) _nodeList.Add(new Node("all", Properties.Resources.All));
			foreach (KeyValuePair<string, object> keyValue in ItemsSource)
			{
				Node node = new Node(keyValue.Key, (string)keyValue.Value);
				_nodeList.Add(node);
			}
			MultiSelectCombo.ItemsSource = _nodeList;
		}

		private void SetText()
		{
			if (SelectedItems != null)
			{
				StringBuilder sb = new StringBuilder();
				foreach (Node s in _nodeList)
				{
					if (s.IsSelected && s.Key == "all")
					{
						sb = new StringBuilder();
						sb.Append(Properties.Resources.All);
						break;
					}
					if (s.IsSelected && s.Key != "all")
					{
						sb.Append(s.Title);
						sb.Append(" | ");
					}
				}
				Text = sb.ToString().TrimEnd(' ', '|');
			}

			if (SelectedItems != null && SelectedItems.Count > 0)
			{
				TextBoxHelper.SetWatermark(MultiSelectCombo, string.Empty);
			}
			else
			{
				TextBoxHelper.SetWatermark(MultiSelectCombo, (string)GetValue(WatermarkProperty));
			}
		}

		#endregion
	}

	public class Node : INotifyPropertyChanged
	{
		private string _key;

		private string _title;

		private bool _isSelected;

		public Node(string key, string title)
		{
			Key = key;
			Title = title;
		}

		#region Properties

		public string Key
		{
			get { return _key; }
			set
			{
				_key = value;
				NotifyPropertyChanged("Key");
			}
		}

		public string Title
		{
			get { return _title; }
			set {
				_title = value;
				NotifyPropertyChanged("Title");
			}
		}

		public bool IsSelected
		{
			get { return _isSelected; }
			set
			{
				_isSelected = value;
				NotifyPropertyChanged("IsSelected");
			}
		}

		#endregion

		public event PropertyChangedEventHandler PropertyChanged;
		protected void NotifyPropertyChanged(string propertyName)
		{
			PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
		}
	}
}
