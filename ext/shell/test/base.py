import json

from app import app, db
from unittest import TestCase
from ext.shell.lib import init_test_db, rebuild_db, drop_all

class BaseTestCase(TestCase):
  '''
    - It is a base TestCase class for the current project.
  '''

  @classmethod
  def setUpClass(cls):
    print 'setUpClass'
    import settings
    settings.TESTING = True
    settings.SQLALCHEMY_DATABASE_URI = 'sqlite:///test.sqlite'

  def db_event_allocate(self):
    '''
      - It prepares the database for future usage.
    '''
    rebuild_db()

  def db_event_dispose(self):
    '''
      - It disposes database resources.
    '''
    db.session.close()
    drop_all()

  def setUp(self):
    '''
      - It prepares tests.
    '''
    self.db_event_allocate()
    self.client = app.test_client()

  def tearDown(self):
    '''
      - It clears traces after the execution of tests.
    '''
    self.db_event_dispose()

  def post_json(self, url, data={}):
    return self.client.post(url, data=json.dumps(data), content_type='application/json')

  def login(self, email, password):
    '''
      - It logins an user to the system.
    '''
    response = self.post_json('/user/rest/login', data=dict(
      email=email,
      password=password,
    ))
    return json.loads(response.data)