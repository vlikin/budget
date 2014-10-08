import json

from app import app
from ext.shell.test.base import BaseTestCase
from ext.core.lib.rest_auth import login, requires_auth
from ext.user.model.user import UserModel


class RestAuthTestCase(BaseTestCase):
  '''
    - It tests the core functionality.
  '''

  def test_user(self):
    user_dict = dict(
      name='user_1',
      password='user_1_password',
      email='user_1@example.com'
    )
    user_obj = UserModel.register(user_dict['email'], user_dict['password'], user_dict['name'])

    @app.route('/test_route/')
    @requires_auth
    def route():
      return 'text'

    # @todo Problem with scope.
    id = user_obj.id

    @app.route('/test_login_route/')
    def login_route():
      login(user_obj)
      return 'text'

    # The stricted page. It is forbidden.
    response = self.client.get('/test_route/')
    assert response.status_code == 401

    # The stricted page. It 's become allowed.
    response = self.client.get('/test_login_route/')
    assert response.status_code == 200

    response = self.client.get('/test_route/')
    print response.status_code