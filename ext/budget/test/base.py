from app import app, db
from unittest import TestCase
from flask.ext.sqlalchemy import SQLAlchemy
from ext.shell.lib import init_db, drop_all

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
    self.db_fd, self.database_uri = tempfile.mkstemp()
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///%s' % self.database_uri
    app.config['TESTING'] = True
    db.init_app(app)
    init_db()
    self.app = app.test_client()
    
    

  def tearDown(self):
    '''
      - It clears traces after the execution of tests.
    '''
    ##drop_all()
    ##os.close(self.db_fd)
    #os.unlink(self.database_uri)