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

def init_test():
  '''
    - Fills the system by test data.
  '''
  rebuild_db()
  from .test_data import test_data

  # User creation.
  for username in test_data['users']:
    test_data['user_objects'][username] =  UserModel.register('%s@example.com' % username, username, username)

  # Budget creation.
  for budget_dict in test_data['budgets']:
    # Budget creation.
    owner_username = test_data['users'][0]
    user_id = test_data['user_objects'][owner_username].id
    budget_object = BudgetModel.create(budget_dict['title'], user_id)
    budget_dict['budget_object'] = budget_object

    # Users are attached to the budget.
    for username in  test_data['users'][1:]:
      user_object = test_data['user_objects'][username]
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