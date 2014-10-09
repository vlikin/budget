import json

from app import app
from ext.shell.test.base import BaseTestCase
from ext.core.lib.rest_auth import login, requires_auth, get_current_user, logout
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

    # It tests the auth lib.
    with app.test_request_context():
      # Default user state.
      logged_user_dict = get_current_user()
      assert None is logged_user_dict

      # The user is logged in.
      login(user_obj)
      logged_user_dict = get_current_user()
      assert logged_user_dict['id'] > 0 and logged_user_dict['id'] == user_obj.id

    # It tests the main 
    with app.test_client() as client:
      # The stricted page. It is forbidden.
      response = client.get('/test_route/')
      assert response.status_code == 401

      # It makes an user authenticated.
      with client.session_transaction() as session:
        session['user'] = dict(
          id=user_obj.id,
          name=user_obj.name
        )

      # It test the restricted route.
      response = client.get('/test_route/')
      assert response.status_code == 200