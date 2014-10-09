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
    response = self.client.post('/user/rest/login', data=user_dict)
    response_user_dict=json.loads(response.data)
    assert response_user_dict['name'] == user_dict['name'] and response.status_code == 200

    # The current user is returned.
    response = self.client.get('/user/rest/current')
    response_user_dict=json.loads(response.data)
    assert response_user_dict['name'] == user_dict['name'] and response.status_code == 200

    # Logout.
    response = self.client.get('/user/rest/logout')
    print response.data
    #response_value=json.loads(response.data)
    #assert response_value
