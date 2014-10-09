from functools import wraps
from flask import request, Response, session
from ext.user.model.user import UserModel

import pdb

def check_auth():
  '''
    - This function is called to check if a name password combination is valid.
  '''
  return ('user' in session) and session['user']['id'] > 0

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
    - It logs in a user to the session.
  '''
  session['user'] = dict(
    id=user.id,
    name=user.name
  )

def get_current_user():
  '''
    - The current user is returned.
  '''
  if ('user' in session) and session['user']['id'] > 0:
    return session['user']
  else:
    return None

def logout():
  '''
    - It logs out the current user.
  '''
  if ('user' in session) and session['user']['id'] > 0:
   del session['user']

def requires_auth(f):
  '''
    - It restricts the access to routes.
  '''
  @wraps(f)
  def decorated(*args, **kwargs):
    if not check_auth():
      return return_login_required()
    return f(*args, **kwargs)
  return decorated