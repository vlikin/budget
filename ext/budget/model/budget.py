from app import db
from ext.budget.table.budget import BudgetTable

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
    budget.title = title
    db.session.add(budget)
    db.session.commit()
    return budget