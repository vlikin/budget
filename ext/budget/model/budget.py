from app import db
from sqlalchemy import and_

from ..table.budget import BudgetTable
from ..table.budget_user import BudgetUserTable
from ..table.contribution import ContributionTable
from ..table.expense import ExpenseTable
from ..table.expense_tag import ExpenseTagTable


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
  def create(title, user_id):
    '''
      - It registers a user into the system.
    '''
    budget = BudgetModel(title)
    
    # It should always commit before it attaches a user to.
    db.session.add(budget)
    db.session.commit()
    budget.attach_user(user_id, 'owner', True)
    return budget

  def attach_user(self, user_id, role='watcher', commit=True):
    if self.user_is_attached(user_id):
      raise Exception('The user with id=%s exists' % user_id)
    budget_user = BudgetUserTable(self.id, user_id, role)
    if commit:
      db.session.add(budget_user)
      db.session.commit()
    return budget_user

  def deattach_user(self, user_id):
    if BudgetUserTable.query.filter(and_(BudgetUserTable.user_id==user_id, BudgetUserTable.budget_id==self.id, BudgetUserTable.role==BudgetUserTable.roles['owner'])).count() == 1:
      raise Exception('It tries to delete a single owner with id=%d of the budget id=%d. It is not allowed' % (user_id, self.id))
    BudgetUserTable.query.filter(and_(BudgetUserTable.budget_id==self.id, BudgetUserTable.user_id==user_id)).delete()

  def user_is_attached(self, user_id):
    return BudgetUserTable.query.filter(and_(BudgetUserTable.budget_id==self.id, BudgetUserTable.user_id==user_id)).count() > 0

  def add_contribution(self, user_id, amount, description="", commit=True):
    contribution = ContributionTable(self.id, user_id, amount, description)
    if commit:
      db.session.add(contribution)
      db.session.commit()
    return contribution

  def load_contribution_by_id(self, id):
    return ContributionTable.query.filter(ContributionTable.id==id).first()

  def remove_contribution_by_id(self, id):
    ContributionTable.query.filter(ContributionTable.id==id).delete()