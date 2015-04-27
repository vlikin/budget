from ext.shell.test.base import BaseTestCase

from ..model.tag import TagModel
from ..model.budget import BudgetModel
from ext.user.model.user import UserModel

class TagModelTestCase(BaseTestCase):
  '''
    - It tests the model - tag functionality.
  '''
  test_budget_data = dict(
    title='test_budget_title',
  )
  test_budget = None
  test_tag_data = dict(
    title='test_tag_title',
  )
  test_tag = None
  test_user=None

  def test_budget(self):
    # Creates a test user.
    name = 'user_1'
    self.test_user = UserModel.register('%s@example.com' % name, name, name)

    self.test_budget = BudgetModel.create(self.test_budget_data['title'], self.test_user.id)
    self.test_tag = TagModel.create(self.test_tag_data['title'], self.test_budget.id)
    assert self.test_tag.title == self.test_tag_data['title']
    assert self.test_tag.budget_id == self.test_budget.id

    tag_id = self.test_tag.id
    another_tag_object = TagModel.load_by_id(tag_id)
    assert another_tag_object.id == tag_id

    TagModel.delete_by_id(tag_id)
    another_tag_object = TagModel.load_by_id(tag_id)
    assert another_tag_object is None