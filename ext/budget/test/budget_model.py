from ext.budget.model.budget import BudgetModel
from ext.budget.model.user import UserModel
from ext.budget.test.base import BaseTestCase

class BudgetModelTestCase(BaseTestCase):
  '''
    - It tests the core functionality.
  '''

  def test_budget(self):
    # Creates a test user.
    username = 'user 1'
    user = UserModel.register('%s@example.com' % username, username, username)

    # Creates a budget, attaches an owner.
    budget_title = 'budget_title'
    budget = BudgetModel.create(budget_title, user.id)
    assert budget.title == budget_title

    # Loads a budget by id.
    budget_id = budget.id
    another_budget_object = BudgetModel.load_by_id(budget_id)
    assert another_budget_object.id == budget_id

    # Deletes a budget by id.
    BudgetModel.delete_by_id(budget_id)
    another_budget_object = BudgetModel.load_by_id(budget_id)
    assert another_budget_object is None

    # Attaches another user to the budget.
    username = 'user 2'
    another_user = UserModel.register('%s@example.com' % username, username, username)
    budget_user = budget.attach_user(another_user.id, 'watcher')
    assert budget_user.user_id == another_user.id and budget_user.budget_id == budget.id

    # Attaches a user at the second time.
    self.assertRaises(Exception, budget.attach_user, (user.id, 'owner'))

    # Checks if the user is attached.
    assert budget.user_is_attached(user.id)

    # Deattaches the single owner from the budget.
    self.assertRaises(Exception, budget.deattach_user, (user.id))

    # Deattaches the user.
    budget.deattach_user(another_user.id)
    assert not budget.user_is_attached(another_user.id)

    # Registers a contribution.
    contribution_dict = dict(
      id=0,
      user_id=user.id,
      amount=40,
      description='Bought bananas at the market.'
    )
    contribution = budget.add_contribution(contribution_dict['user_id'], contribution_dict['amount'], contribution_dict['description'])
    assert (contribution.id > 0\
      and contribution.user_id == contribution_dict['user_id']\
      and contribution.amount == contribution_dict['amount']\
      and contribution.description == contribution_dict['description'])
    contribution_dict['id'] = contribution.id

    # Loads the contribution.
    another_contribution = budget.load_contribution_by_id(contribution_dict['id'])
    assert another_contribution.id > 0 and another_contribution.id == contribution_dict['id']

    # Deletes the contribution.
    budget.remove_contribution_by_id(contribution_dict['id'])
    another_contribution = budget.load_contribution_by_id(contribution_dict['id'])
    assert another_contribution is None

    # Registers an expense.
    expense_dict = dict(
      user_id=user.id,
      amount=40,
      description='Bought bananas at the market.'
    )
    expense = budget.add_expense(expense_dict['user_id'], expense_dict['amount'], expense_dict['description'])
    assert (expense.id > 0\
      and expense.user_id == expense_dict['user_id']\
      and expense.amount == expense_dict['amount']\
      and expense.description == expense_dict['description'])
    expense_dict['id'] = expense.id

    # Loads the expense.
    another_expense = budget.load_expense_by_id(expense_dict['id'])
    assert another_expense.id > 0 and another_expense.id == expense_dict['id']

    # Deletes the expense.
    budget.remove_expense_by_id(expense_dict['id'])
    another_expense = budget.load_expense_by_id(expense_dict['id'])
    assert another_expense is None