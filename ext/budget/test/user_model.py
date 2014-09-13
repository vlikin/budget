from ext.budget.model.user import UserModel
from ext.budget.test.base import BaseTestCase

class UserModelTestCase(BaseTestCase):
  '''
    - It tests the core functionality.
  '''
  test_user_data = dict(
    username='test_user_username',
    email='test_user_email@example.com',
    password='test_user_password'
  )
  test_user = None

  def test_user(self):
    self.test_user = UserModel.register(self.test_user_data['email'], self.test_user_data['password'], self.test_user_data['username'])
    assert self.test_user.email == self.test_user_data['email']
    assert self.test_user.username == self.test_user_data['username']