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
    # Is an email free?
    assert UserModel.is_free(self.test_user_data['email'])

    # It registers a user.
    self.test_user = UserModel.register(self.test_user_data['email'], self.test_user_data['password'], self.test_user_data['username'])
    assert self.test_user.email == self.test_user_data['email']
    assert self.test_user.username == self.test_user_data['username']

    # It checks that the user has been already registered.
    assert not UserModel.is_free(self.test_user_data['email'])
    self.assertRaises(Exception, UserModel.register, (self.test_user_data['email'], self.test_user_data['password'], self.test_user_data['username']))

    # It loads a user by id
    another_user_object = UserModel.load_by_id(self.test_user.id)
    assert another_user_object.email == self.test_user.email

    # It updates a user profile.
    self.test_user.update_profile(dict(email='changed_%s' % self.test_user_data['email']))
    assert self.test_user.email != self.test_user_data['email']
    assert self.test_user.email == 'changed_%s' % self.test_user_data['email']

    # It deletes a user by id.
    UserModel.delete_by_id(self.test_user.id)
    self.test_user = None
    assert UserModel.is_free(self.test_user_data['email'])