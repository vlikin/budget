import json

from flask import jsonify, request
from app import app
from ext.core.exception import LogicException
from ext.core.lib.rest_auth import login, requires_auth, requires_anonym, get_current_user, logout, is_authenticated
from .model.user import UserModel


@app.route('/user/profile/get', methods=['POST'])
@requires_auth
def get_profile_route():
  '''
    - It returns the profile of the current user.
  '''
  user = get_current_user();
  return jsonify(dict(
    id=user.id,
    email=user.email,
    name=user.name
  ))

@app.route('/user/rest/login', methods=['POST'])
@requires_anonym
def login_route():
  '''
    - It logins a user in the system.
  '''
  user_dict = json.loads(request.data)
  email = user_dict['email']
  password = user_dict['password']

  if UserModel.check_auth_by_pass(email, password):
    user = UserModel.load_by_email(email)
    login(user)
    return jsonify(dict(
      success=True,
      message='You have been authenticated successfuly.',
      user=dict(
        id=user.id,
        email=user.email
      )
    ))
  else:
    return jsonify(dict(
      success=False,
      message='Wrong authentication data.'
    ))

@app.route('/user/rest/register', methods=['GET', 'POST'])
@requires_anonym
def register_route():
  '''
    - It registers a user.
    @test = false
  '''
  user_dict = json.loads(request.data)
  email = user_dict['email']
  password = user_dict['password']
  confirm_password = user_dict['confirm_password']
  if password != confirm_password:
    raise LogicException('Passwords are not equal.')
  name = user_dict['name']
  user = UserModel.register(email, password, name)

  return jsonify(dict(
    success=True,
    message='You have been registered into the system successfuly.',
    user=dict(
      id=user.id,
      email=user.email
    )
  ))

@app.route('/user/rest/logout', methods=['GET'])
@requires_auth
def logout_route():
  logout()
  return jsonify({'success': True})

@app.route('/user/rest/email_is_free', methods=['POST'])
def email_is_free_route():
  '''
    - Email exists.
  '''
  data_dict = json.loads(request.data)
  return jsonify({
    'success': UserModel.is_free(data_dict['email'])
  })

@app.route('/user/rest/current', methods=['GET'])
@requires_auth
def current_route():
  return jsonify(get_current_user())
