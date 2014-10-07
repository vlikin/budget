from functools import wraps
from flask import request, Response
from ext.user.model.user import UserModel

# User object, initialized once.
user = None

def check_auth():
  '''
    - This function is called to check if a username password combination is valid.
  '''
  return hasattr(request.session, 'user') and request.session['user'].id > 0

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
    if not check_auth():
      return return_login_required()
    return f(*args, **kwargs)
  return decorated