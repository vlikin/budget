from ext.shell.test.base import BaseTestCase

from ..model.expense import ExpenseModel
from ..model.budget import BudgetModel
from ..model.tag import TagModel
from ext.user.model.user import UserModel

class ExpenseModelTestCase(BaseTestCase):
  '''
    - It tests the model - tag functionality.
  '''

  def test_budget(self):
    # Creates a test user.
    username = 'user 1'
    user = UserModel.register('%s@example.com' % username, username, username)
    
    # Creates a budget, attaches an owner.
    budget_title = 'budget_title'
    budget = BudgetModel.create(budget_title, user.id)

    # Creates a budget, attaches an owner.
    another_budget_title = 'another_budget_title'
    another_budget = BudgetModel.create(another_budget_title, user.id)

    tag_1 = TagModel.create('tag_1', budget.id)
    tag_2 = TagModel.create('tag_2', budget.id)
    tag_3 = TagModel.create('tag_3', budget.id)
    tag_4 = TagModel.create('tag_4', budget.id)
    another_budget_tag_5 = TagModel.create('another_budget_tag_5', another_budget.id)

    # Registers an expense.
    expense_dict = dict(
      user_id=user.id,
      amount=40,
      description='Bought bananas at the market.'
    )

    # Tags from another budget are not allowed.
    expense = self.assertRaises(Exception, ExpenseModel.create, (budget.id, expense_dict['user_id'], expense_dict['amount'], [tag_1, another_budget_tag_5], expense_dict['description']))

    # Creates and attaches an expense.
    expense = ExpenseModel.create(budget.id, expense_dict['user_id'], expense_dict['amount'], [tag_1, tag_3], expense_dict['description'])
    assert expense.id > 0
    expense_dict['id'] = expense.id

    # Loads the expense.
    another_expense = ExpenseModel.load_by_id(expense_dict['id'])
    assert another_expense.id > 0 and another_expense.id == expense_dict['id']

    # Deletes the expense.
    ExpenseModel.remove_by_id(expense_dict['id'])
    another_expense = ExpenseModel.load_by_id(expense_dict['id'])
    assert another_expense is None