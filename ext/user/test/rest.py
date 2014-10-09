import json

from ext.shell.test.base import BaseTestCase
from ext.user.model.user import UserModel

class UserRestTestCase(BaseTestCase):
  '''
    - It tests the core functionality.
  '''

  def test_user(self):
    user_dict = dict(
      name='test_user_username',
      email='test_user_email@example.com',
      password='test_user_password'
    )
    self.test_user = UserModel.register(user_dict['email'], user_dict['password'], user_dict['name'])
    response = self.client.post('/user/rest/login', data=user_dict, follow_redirects=True)
    data=json.loads(response.data)
    assert response.status_code == 200
    assert data['ok'] == 'ok'