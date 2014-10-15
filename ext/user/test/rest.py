import json

from ext.shell.test.base import BaseTestCase
from ext.user.model.user import UserModel


class UserRestTestCase(BaseTestCase):
  '''
    - It tests the core functionality.
  '''

  def test_user(self):
    user_dict = dict(
      name='test_user_name',
      email='test_user_email@example.com',
      password='test_user_password'
    )
    self.test_user = UserModel.register(user_dict['email'], user_dict['password'], user_dict['name'])

    # User log in failure.
    response = self.client.post('/user/rest/login', data=dict(name='name', passsword='password'))
    response_user_dict=json.loads(response.data)
    assert response_user_dict['success'] == False and response_user_dict['message'] == 'Wrong authentication data.'

    # Logs in a user.
    response = self.client.post('/user/rest/login', data=user_dict)
    response_user_dict=json.loads(response.data)
    assert response_user_dict['success'] == True and response_user_dict['user']['name'] == user_dict['name']

    # Failure - a user has been alredy authenticated.
    response = self.client.post('/user/rest/login', data=user_dict)
    response_user_dict=json.loads(response.data)
    assert response_user_dict['success'] == False and response_user_dict['message'] == 'You have been authenticated before.'

    # The current user is returned.
    response = self.client.get('/user/rest/current')
    response_user_dict=json.loads(response.data)
    assert response_user_dict['name'] == user_dict['name'] and response.status_code == 200

    # Logout.
    response = self.client.get('/user/rest/logout')
    response_dict=json.loads(response.data)
    assert response_dict['success'] == True

    # The current user is not returned. It needs authentication.
    response = self.client.get('/user/rest/current')
    assert response.status_code == 401
