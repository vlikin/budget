from app import db
from ..table.expense import ExpenseTable
from ..table.expense_tag import ExpenseTagTable

class ExpenseModel(ExpenseTable):

  @staticmethod
  def remove_by_id(id):
    '''
      - It deletes a user by his id.
    '''
    ExpenseTable.query.filter(ExpenseTable.id==id).delete()

  @staticmethod
  def load_by_id(user_id):
    '''
      - It loads a user by his id.
    '''
    return ExpenseTable.query.filter(ExpenseTable.id==user_id).first()

  @staticmethod
  def create(budget_id, user_id, amount, tag_list=[], description=""):
    expense = ExpenseTable(budget_id, user_id, amount, description)
    db.session.add(expense)
    db.session.commit()
    for tag in tag_list:
      if tag.budget_id != budget_id:
        raise Exception('You should not attach a tag from another budget.')
      expense_tag = ExpenseTagTable(expense.id, tag.id)
      db.session.add(expense_tag)
    db.session.commit()
    return expense

  def load_tags(self):
    if not hasattr(self, loaded_tags):
      loaded_tags = []