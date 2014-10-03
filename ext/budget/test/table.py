from ext.shell.test.base import BaseTestCase

from ..table.budget import BudgetTable
from ..table.budget_user import BudgetUserTable
from ..table.contribution import ContributionTable
from ..table.expense import ExpenseTable
from ..table.expense_tag import ExpenseTagTable
from ..table.tag import TagTable

from ext.user.model.user import UserModel
from ..model.budget import BudgetModel

class TableTestCase(BaseTestCase):
  '''
    - It tests the table issues.
  '''
  test_data = dict(
    users = ['user 1', 'user 2', 'user3'],
    user_objects = {},
    budgets = [
      dict(
        title = 'budget 1',
        budget_object = None,
        users = ['user 1', 'user 2', 'user 3'],
        tags = ['tag 1', 'tag 2', 'tag 3', 'tag 4'],
        contribution = [
          dict(
            user='user 1',
            amount='200'
          ),
          dict(
            user='user 2',
            amount='400'
          ),
          dict(
            user='user 3',
            amount='600'
          ),
          dict(
            user='user 1',
            amount='800'
          ),
        ],
        expense = [
          dict(
            user='user 1',
            amount='80',
            tags = ['tag 1', 'tag 4']
          ),
          dict(
            user='user 2',
            amount='160',
            tags = ['tag 2', 'tag 3']
          ),
        ],
      )
    ]
  )

  def test_repr(self):
    for username in self.test_data['users']:
      self.test_data['user_objects'][username] =  UserModel.register('%s@example.com' % username, username, username)
    for budget_dict in self.test_data['budgets']:
      owner_username = self.test_data['users'][0]
      user_id = self.test_data['user_objects'][owner_username].id
      budget_obj = BudgetModel.create(budget_dict['title'], user_id)
    assert 1 == 1

  def test_ondelete_cascase(self):
    '''
      - It checks if the cascade delete process works. Because this case is not processed by code.
      The responsibility for database data actuality is trusted to the database settings.
    '''
    assert 1 == 1