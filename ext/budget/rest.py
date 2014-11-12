import json

from flask import jsonify, request
from app import app
from ext.core.exception import LogicException
from ext.core.lib.rest_auth import login, requires_auth, requires_anonym, get_current_user, logout, is_authenticated
from .model.user import UserModel
from .model.budget import BudgetModel


@app.route('/budget/index', methods=['GET'])
@requires_auth
def budget_index_route():
  '''
    - It returns the profile of the current user.

    @test = false
  '''
  return jsonify(dict(
    success = True
  ))

@app.route('/budget/get/<int:id>', methods=['GET'])
@requires_auth
def budget_get_route(id):
  '''
    - It returns the profile of the current user.

    @test = false
  '''
  return jsonify(dict(
    success = True
  ))

@app.route('/budget/create', methods=['POST'])
@requires_auth
def budget_index_route():
  '''
    - It returns the profile of the current user.

    @test = false
  '''
  return jsonify(dict(
    success = True
  ))

@app.route('/budget/update', methods=['POST'])
@requires_auth
def budget_update_route():
  '''
    - It returns the profile of the current user.

    @test = false
  '''
  return jsonify(dict(
    success = True
  ))