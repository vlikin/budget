from app import app, db
from unittest import TestCase
from ext.shell.lib import init_db

import os
import tempfile


class BaseTestCase(TestCase):
  '''
    - It is a base TestCase class for the current project.
  '''

  def setUp(self):
    '''
      - It prepares tests.
    '''
    self.db_fd, app.config['DATABASE'] = tempfile.mkstemp()
    app.config['TESTING'] = True
    self.app = app.test_client()
    init_db()

  def tearDown(self):
    '''
      - It clears traces after the execution of tests.
    '''
    os.close(self.db_fd)
    os.unlink(app.config['DATABASE'])