from unittest import TestCase
import os
from lib import load_tags

class LibCase(TestCase):
  @classmethod
  def setUpClass(cls):
    pass

  def setUp(self):
    pass

  def tearDown(self):
    pass

  def test_lib(self):
    print 'Hi!'
    data_folder = os.path.join(os.path.dirname(__file__), 'data_test')
    tags_path = os.path.join(data_folder, 'tags.json')
    tags = load_tags(tags_path)
    print data_folder
    print tags
    assert 1 == 1