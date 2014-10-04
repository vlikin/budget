from ext.shell.test.base import BaseTestCase
from ext.user.model.user import UserModel

class UserRestTestCase(BaseTestCase):
  '''
    - It tests the core functionality.
  '''

  def test_user(self):
    user_dict = dict(
      username='user 1',
      password='user 1 password'
    )
    response = self.client.get('/user/rest/login', data=user_dict, follow_redirects=True)
    print response
    print response.data.__class__.__name__
    print 'Hi'
    assert 1 == 1