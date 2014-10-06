from functools import wraps
from flask import request, Response
from ext.user.model.user import UserModel

# User object, initialized once.
user = None

def check_auth(username, password, reset=False):
  '''
    - This function is called to check if a username password combination is valid.
  '''
  global user
  if not user or reset:
    user = UserModel.load_by_name(username)
  return user.username == username and user.password == password

def return_login_required():
  '''
    - Sends a 401 response that enables basic auth
  '''
  return Response(
    'Could not verify your access level for that URL.\n'
    'You have to login with proper credentials', 401,
    {'WWW-Authenticate': 'Basic realm="Login Required"'}
  )

def login(user):
  '''
    - 
  '''
  flask.session['user'] = user

def requires_auth(f):
  @wraps(f)
  def decorated(*args, **kwargs):
    auth = request.authorization
    if not auth or not check_auth(auth.username, auth.password):
      return return_login_required()
    return f(*args, **kwargs)
  return decorated