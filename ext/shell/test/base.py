from app import app, db
from unittest import TestCase
from ext.shell.lib import rebuild_db, drop_all

class BaseTestCase(TestCase):
  '''
    - It is a base TestCase class for the current project.
  '''

  def setUp(self):
    '''
      - It prepares tests.
    '''
    rebuild_db()
    self.app = app.test_client()

  def tearDown(self):
    '''
      - It clears traces after the execution of tests.
    '''
    db.session.close()
    drop_all()

  def login(self, username, password):
    '''
      - It logins an user to the system.
    '''
    return self.app.post('/login/', data=dict(
      username=username,
      password=password,
    ), follow_redirects=True)