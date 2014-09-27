from app import db
from ext.budget.model.user import UserModel
from ext.budget.model.budget import BudgetModel
from ext.budget.model.tag import TagModel

def rebuild_db():
  '''
    - It initialize the database at the first time. Be careful.
  '''
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
  for username in test_data['users']:
    test_data['user_objects'][username] =  UserModel.register('%s@example.com' % username, username, username)

  # Budgets creation.
  for budget_dict in test_data['budgets']:
    # Budget creation.
    owner_username = test_data['users'][0]
    user_id = test_data['user_objects'][owner_username].id
    budget_object = BudgetModel.create(budget_dict['title'], user_id)
    budget_dict['budget_object'] = budget_object

    # Tag creations.
    for tag_name in budget_dict['tags']:
      tag = TagModel.create(tag_name, budget_dict['budget_object'].id)
      budget_dict['tag_objects'][tag_name] = tag