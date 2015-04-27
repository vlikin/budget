
from unittest import TestCase
import os
import pdb

from datetime import datetime
from IPython.display import HTML
from lib import load_tags, prepare_tags, get_flat_tags, load_expenses, attach_expenses2tags, calculate_tags_capacity, display_tree

class LibCase(TestCase):
  @classmethod
  def setUpClass(cls):
    pass

  def setUp(self):
    pass

  def tearDown(self):
    pass

  def test_process_1(self):
    data_folder = os.path.join(os.path.dirname(__file__), 'data_test')
    tags_path = os.path.join(data_folder, 'tags.json')
    expenses_path = os.path.join(data_folder, 'expenses.csv')

    loaded_tags = load_tags(tags_path)
    assert loaded_tags['Tag_2']['_']['Tag_2_3']['_']['Tag_2_3_2'] != None
    
    tags = prepare_tags(loaded_tags)
    assert tags['Tag_2']['_']['Tag_2_3']['_']['Tag_2_3_2']['parent'][0] == 'Tag_2_3'
    assert tags['Tag_2']['_']['Tag_2_3']['_']['Tag_2_3_2']['level'] == 2

    flat_tags = get_flat_tags(tags)
    assert flat_tags.has_key('Tag_1')
    assert flat_tags.has_key('Tag_2_3_2')

    expenses = load_expenses(expenses_path)
    row = expenses[4]
    assert type(row[0]) is datetime
    assert type(row[1]) is float
    assert type(row[2]) is list

    attach_expenses2tags(expenses, tags)
    #tag = tags['Tag_2']['_']['Tag_2_3']
    tag = tags['Tag_1']
    assert tag['volume'] > 0
    assert len(tag['expenses']) > 0

    calculate_tags_capacity(tags)
    tag = tags['Tag_1']
    assert tag['capacity'] > 0

    tags_html = display_tree(tags)
    assert type(tags_html) is HTML

  def test_process_2(self):
    data_folder = os.path.join(os.path.dirname(__file__), 'data_test')
    tags_path = os.path.join(data_folder, 'tags.json')
    expenses_path = os.path.join(data_folder, 'expenses.csv')
    loaded_tags = load_tags(tags_path)
    tags = prepare_tags(loaded_tags)
    flat_tags = get_flat_tags(tags)
    expenses = load_expenses(expenses_path)
    attach_expenses2tags(expenses, tags)
    calculate_tags_capacity(tags)