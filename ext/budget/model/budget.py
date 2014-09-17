from app import db
from sqlalchemy import and_

from ext.budget.table.budget import BudgetTable
from ext.budget.table.budget_user import BudgetUserTable


class BudgetModel(BudgetTable):

  @staticmethod
  def delete_by_id(id):
    '''
      - It deletes a user by his id.
    '''
    BudgetModel.query.filter(BudgetModel.id==id).delete()

  @staticmethod
  def load_by_id(user_id):
    '''
      - It loads a user by his id.
    '''
    return BudgetModel.query.filter(BudgetModel.id==user_id).first()

  @staticmethod
  def create(title):
    '''
      - It registers a user into the system.
    '''
    budget = BudgetModel(title)
    db.session.add(budget)
    db.session.commit()
    return budget

  def attach_user(self, user_id, role='watcher'):
    if self.user_is_attached(user_id):
      raise Exception('The user with id=%s exists' % user_id)
    return BudgetUserTable(self.id, user_id, role)

  def deattach_user(self, user_id):
    BudgetUserTable.query.filter(and_(BudgetUserTable.budget_id==self.id, BudgetUserTable.user_id==user_id)).delete()

  def user_is_attached(self, user_id):
    return BudgetUserTable.query.filter(and_(BudgetUserTable.budget_id==self.id, BudgetUserTable.user_id==user_id)).count() > 0