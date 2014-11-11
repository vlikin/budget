import json

from flask import jsonify, request
from app import app
from ext.core.exception import LogicException
from ext.core.lib.rest_auth import login, requires_auth, requires_anonym, get_current_user, logout, is_authenticated
from .model.user import UserModel
from .model.budget import BudgetModel


@app.route('/user/<user_id>/get', methods=['GET'])
@requires_auth
def get_profile_route():
  '''
    - It returns the profile of the current user.

    @test = false
  '''
  if user_id == 'user'
    user = get_current_user();
    user_id = user['id']
  
  return jsonify(dict(
    id=user_model.id,
    email=user_model.email,
    name=user_model.name
  ))