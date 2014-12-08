
from unittest import TestCase
import os
import pdb
from lib import load_tags, prepare_tags, get_flat_tags

class LibCase(TestCase):
  @classmethod
  def setUpClass(cls):
    pass

  def setUp(self):
    pass

  def tearDown(self):
    pass

  def test_lib(self):
    data_folder = os.path.join(os.path.dirname(__file__), 'data_test')
    tags_path = os.path.join(data_folder, 'tags.json')
    
    loaded_tags = load_tags(tags_path)
    assert loaded_tags['Tag_2']['_']['Tag_2_3']['_']['Tag_2_3_2'] != None
    
    tags = prepare_tags(loaded_tags)
    assert tags['Tag_2']['_']['Tag_2_3']['_']['Tag_2_3_2']['parent'][0] == 'Tag_2_3'
    assert tags['Tag_2']['_']['Tag_2_3']['_']['Tag_2_3_2']['level'] == 2

    flat_tags = get_flat_tags(tags)
    assert flat_tags.has_key('Tag_1')
    assert flat_tags.has_key('Tag_2_3_2')

    assert 1 == 1