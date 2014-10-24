import json

from app import app, db
from unittest import TestCase
from ext.shell.lib import init_test_db, rebuild_db, drop_all

class BaseTestCase(TestCase):
  '''
    - It is a base TestCase class for the current project.
  '''

  def setUp(self):
    '''
      - It prepares tests.
    '''
    rebuild_db()
    #init_test_db()
    self.client = app.test_client()

  def tearDown(self):
    '''
      - It clears traces after the execution of tests.
    '''
    db.session.close()
    drop_all()

  def post_json(self, url, data):
    return self.client.post(url, data=json.dumps(data), content_type='application/json')

  def login(self, name, password):
    '''
      - It logins an user to the system.
    '''
    return self.app.post('/login/', data=dict(
      name=name,
      password=password,
    ), follow_redirects=True)