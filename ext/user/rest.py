import json

from flask import jsonify, request
from app import app
from ext.core.lib.rest_auth import login, requires_auth, get_current_user, logout, is_authenticated
from .model.user import UserModel

@app.route('/user/rest/login', methods=['GET', 'POST'])
def login_route():
  if is_authenticated():
    return jsonify(dict(
      success=False,
      message='You have been authenticated before.'
    ))

  user_dict = json.loads(request.data)
  name = user_dict['name']
  password = user_dict['password']
  user = UserModel.load_by_name_password(name, password)

  if user:
    login(user)
    return jsonify(dict(
      success=True,
      message='You have been authenticated successfuly.',
      user=dict(
        id=user.id,
        name=user.name
      )
    ))
  else:
    return jsonify(dict(
      success=False,
      message='Wrong authentication data.'
    ))

@app.route('/user/rest/logout', methods=['GET'])
@requires_auth
def logout_route():
  logout()
  return jsonify({'success': True})

@app.route('/user/rest/email_exists', methods=['GET'])
def email_exists_route():
  '''
    - Email exists.
    @test = false
  '''
  exists = False
  data_dict = json.loads(request.data)
  return jsonify({'success': exists})

@app.route('/user/rest/current', methods=['GET'])
@requires_auth
def current_route():
  return jsonify(get_current_user())


