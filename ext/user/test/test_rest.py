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

    # Registers an user.
    form_data = dict(confirm_password=user_dict['password'])
    form_data.update(user_dict)
    response = self.post_json('/user/rest/register', data=form_data)
    response_dict = json.loads(response.data)
    user_dict['id'] = response_dict['user']['id']
    assert response_dict['success'] == True and response_dict['user']['email'] == user_dict['email'] and response_dict['message'] == 'You have been registered into the system successfuly.'

    # User log in failure.
    response = self.post_json('/user/rest/login', data=dict(email='email', password='password'))
    response_dict=json.loads(response.data)
    assert response_dict['success'] == False and response_dict['message'] == 'Wrong authentication data.'

    # Logs in a user.
    response = self.post_json('/user/rest/login', data=user_dict)
    response_dict=json.loads(response.data)
    assert response_dict['success'] == True and response_dict['user']['id'] == user_dict['id'] and response_dict['user']['email'] == user_dict['email']

    # Email does not exist.
    response = self.post_json('/user/rest/email_is_free', data=dict(email='wrong@example.com'))
    response_user_dict=json.loads(response.data)
    assert response_user_dict['success'] == True

    # Email exists.
    response = self.post_json('/user/rest/email_is_free', data=dict(email=user_dict['email']))
    response_user_dict=json.loads(response.data)
    assert response_user_dict['success'] == False

    # Failure - a user has been alredy authenticated. It can be used only by anonymouse users.
    response = self.post_json('/user/rest/login', data=user_dict)
    assert response.status_code == 401

    # The current user is returned.
    response = self.client.get('/user/rest/current')
    response_user_dict = json.loads(response.data)
    assert response_user_dict['name'] == user_dict['name'] and response.status_code == 200

    # The user profile is returned.
    response = self.client.get('/user/profile/get')
    response_profile_dict = json.loads(response.data)
    assert response_profile_dict['name'] == user_dict['name'] and response_profile_dict['email'] == user_dict['email'] and response.status_code == 200

    # The user profile is returned.
    response_profile_dict['name'] = '%s - changed' % response_profile_dict['name']
    response = self.post_json('/user/profile/update', data=response_profile_dict)
    response_dict = json.loads(response.data)
    user_model = UserModel.load_by_id(user_dict['id'])
    assert response_dict['success'] and user_model.name == response_profile_dict['name']

    # Logout.
    response = self.client.get('/user/rest/logout')
    response_dict=json.loads(response.data)
    assert response_dict['success'] == True

    # The current user is not returned. It needs authentication.
    response = self.client.get('/user/rest/current')
    assert response.status_code == 401
