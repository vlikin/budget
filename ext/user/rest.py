from flask import jsonify, request
from app import app
from ext.core.lib.rest_auth import login, requires_auth, get_current_user, logout
from .model.user import UserModel

@app.route('/user/rest/login', methods=['POST'])
def login_route():
  name = request.form.get('name')
  password = request.form.get('password')
  user = UserModel.load_by_name_password(name, password)
  login(user)
  return jsonify(dict(
    id=user.id,
    name=user.name
  ))

@app.route('/user/rest/logout', methods=['GET'])
@requires_auth
def logout_route():
  logout()
  return jsonify(True)

@app.route('/user/rest/current', methods=['GET'])
@requires_auth
def current_route():
  return jsonify(get_current_user())


