from .base import BaseTestCase
from ext.shell.test_data import test_data
from ext.shell.lib import init_test_db


class ReadyDataBaseTestCase(BaseTestCase):
  '''
    - It is a base TestCase class for the current project with prepared data
  '''
  init_db = False

  def db_preparation(self):
    '''
      @overridden
    '''
    if ReadyDataBaseTestCase.init_db:
      init_test_db(test_data)

  def db_event_dispose(self):
    '''
      @overridden
    '''
    if ReadyDataBaseTestCase.init_db:
      super(ReadyDataBaseTestCase, self).db_event_dispose()
