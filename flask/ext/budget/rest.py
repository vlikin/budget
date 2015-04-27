import json

from flask import jsonify, request
from app import app
from ext.core.exception import LogicException
from ext.core.lib.rest_auth import login, requires_auth, requires_anonym, get_current_user, logout, is_authenticated
from .table.budget import BudgetTable
from .table.budget_user import BudgetUserTable

@app.route('/budget/index', methods=['POST'])
@requires_auth
def budget_index_route():
  '''
    - It returns the profile of the current user.

    @test = false
  '''
  user = get_current_user()
  budget_list = db.session\
    .query(BudgetTable)\
    .select_from(BudgetTable)\
    .outerjoin(BudgetUserTable, BudgetTable.id==BudgetUserTable.budget_id)\
    .filter(BudgetUserTable.user_id==1)\
    .all()
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
def budget_create_route():
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