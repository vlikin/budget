from functools import wraps
from flask import request, Response, session
from ext.user.model.user import UserModel

import pdb

def check_auth():
  '''
    - This function is called to check if a name password combination is valid.
  '''
  return ('user' in session) and session['user']['id'] > 0

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

def is_authenticated():
  '''
    - Checks if a current user is authenticated.
  '''
  return ('user' in session) and session['user']['id'] > 0

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
      return Response(
        'Could not verify your access level for that URL.\nYou have to login with proper credentials',
        401,
        {'WWW-Authenticate': 'Basic realm="Login Required"'}
      )
    return f(*args, **kwargs)
  return decorated

def requires_anonym(f):
  '''
    - It restricts the access to routes.
  '''
  @wraps(f)
  def decorated(*args, **kwargs):
    if is_authenticated():
      return Response(
        'You\'ve alredy logged to the system.\nLog out from the system.',
        401,
        {'WWW-Authenticate': 'Basic realm="Anonym Required"'}
      )
    return f(*args, **kwargs)
  return decorated