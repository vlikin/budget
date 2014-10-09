from flask import jsonify, request
from app import app
from ext.core.lib.rest_auth import login, requires_auth, get_current_user, logout

@app.route('/user/rest/login', methods=['GET', 'POST'])
def login():
  #name = request.args['name']
  #password = request.args['password']
  return jsonify({'ok': 'ok'})

@app.route('/user/rest/logout', methods=['GET', 'POST'])
def logout():
  return jsonify({'ok': 'ok'})

@app.route('/user/rest/current', methods=['GET', 'POST'])
@requires_auth
def current():
  return jsonify(get_current_user())


