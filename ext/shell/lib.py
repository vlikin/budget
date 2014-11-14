import csv
import os
import json
from datetime import datetime

from app import db
from ext.budget.model.budget import BudgetModel
from ext.budget.model.tag import TagModel
from ext.budget.model.expense import ExpenseModel
from ext.user.model.user import UserModel

def rebuild_db():
  '''
    - It initialize the database at the first time. Be careful.
  '''
  import ext.user.table
  import ext.budget.table
  db.session.close()
  db.drop_all()
  db.create_all()

def drop_all():
  '''
    - It drops the database at the first time. Be careful.
  '''
  db.drop_all()

def init_real_data_v1():
  '''
    - Fills the system by real data to test the interface by real users.
  '''
  rebuild_db()
  data_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'real_data_v1')
  print 'The process "init_real_data_v1" has been started.'
  print 'path - %s' % data_dir

  # User creation.
  users = json.load(open(os.path.join(data_dir, 'users.json')))
  for user in users:
    user['obj'] = UserModel.register(user['email'], user['password'], user['name'])
    user['id'] = user['obj'].id

  # Budget creation.
  budget = json.load(open(os.path.join(data_dir, 'budget.json')))
  budget['obj'] = BudgetModel.create(budget['title'], users[0]['id'])
  budget['id'] = budget['obj'].id
  # Users are attached to the budget.
  for user in  users[1:]:
    budget['obj'].attach_user(user['obj'].id)

  # Tag creation.
  with open(os.path.join(data_dir, 'tags.json')) as json_file:
    tags = json.load(json_file)

  flat_tags = {}

  def go_over(tags, parent=None):
    for tag_name, tag in tags.items():
      parent_id = parent['obj']['id'] if parent else None
      tag['obj'] = TagModel.create(tag_name, budget['id'], parent_id)
      flat_tags[tag_name] = tag
      if '_' in tag:
        go_over(tag['_'], parent)

  go_over(tags)
  # Contribution creation.
  # @todo - Fill contributions.
  # Expense creation.
  with open(os.path.join(data_dir, 'expenses.csv')) as csv_file:
    reader = csv.reader(csv_file)
    for row in reader:
      tag_list = [flat_tags[row[2]]['obj']]
      user = users[0];
      # @todo - pass expenses expenses.
      ExpenseModel.create(budget['id'], user['id'], row[1], tag_list, '')

def init_test_db(test_data):
  '''
    - Fills the system by test data.
  '''
  rebuild_db()

  # User creation.
  for name in test_data['users']:
    test_data['user_objects'][name] =  UserModel.register('%s@example.com' % name, name, name)

  # Budget creation.
  for budget_dict in test_data['budgets']:
    # Budget creation.
    owner_name = test_data['users'][0]
    user_id = test_data['user_objects'][owner_name].id
    budget_object = BudgetModel.create(budget_dict['title'], user_id)
    budget_dict['budget_object'] = budget_object

    # Users are attached to the budget.
    for name in  test_data['users'][1:]:
      user_object = test_data['user_objects'][name]
      budget_object.attach_user(user_object.id)

    # Tag creation.
    for tag_name in budget_dict['tags']:
      tag = TagModel.create(tag_name, budget_object.id)
      budget_dict['tag_objects'][tag_name] = tag

    # Contribution creation.
    for contribution_dict in budget_dict['contributions']:
      user_object = test_data['user_objects'][contribution_dict['user']]
      contribution_object = budget_object.add_contribution(user_object.id, contribution_dict['amount'])
      contribution_dict['object'] = contribution_object

    # Expense creation.
    for expense_dict in budget_dict['expenses']:
      user_object = test_data['user_objects'][expense_dict['user']]
      tag_list = [ budget_dict['tag_objects'][tag_name] for tag_name in expense_dict['tags']]
      expense_dict['object'] = ExpenseModel.create(budget_object.id, user_object.id, expense_dict['amount'], tag_list, expense_dict['description'])