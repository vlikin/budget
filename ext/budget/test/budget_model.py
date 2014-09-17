from ext.budget.model.budget import BudgetModel
from ext.budget.model.user import UserModel
from ext.budget.test.base import BaseTestCase

class BudgetModelTestCase(BaseTestCase):
  '''
    - It tests the core functionality.
  '''
  test_budget_data = dict(
    title='test_budget_title',
  )
  test_budget = None
  test_user=None

  def test_budget(self):
    self.test_budget = BudgetModel.create(self.test_budget_data['title'])
    assert self.test_budget.title == self.test_budget_data['title']

    budget_id = self.test_budget.id
    another_budget_object = BudgetModel.load_by_id(budget_id)
    assert another_budget_object.id == budget_id

    BudgetModel.delete_by_id(budget_id)
    another_budget_object = BudgetModel.load_by_id(budget_id)
    assert another_budget_object is None

    username = 'user 1'
    self.test_user = UserModel.register('%s@example.com' % username, username, username)

    budget_user = self.test_budget.attach_user(self.test_user.id, 'owner')
    assert budget_user.user_id == self.test_user.id and budget_user.budget_id == self.test_budget.id