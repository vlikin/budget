from app import db
from sqlalchemy.orm import relationship

from .tag import TagTable
from .expense import ExpenseTable

class ExpenseTagTable(db.Model):
  __table_args__ = (
    db.ForeignKeyConstraint(['expense_id'], [ExpenseTable.id], ondelete='CASCADE'),
    db.ForeignKeyConstraint(['tag_id'], [TagTable.id], ondelete='CASCADE'),
    db.UniqueConstraint('expense_id', 'tag_id', name='expense_tag')
  )
  id = db.Column(db.Integer, primary_key=True)
  expense_id = db.Column(db.Integer, nullable=False)
  tag_id = db.Column(db.Integer, nullable=False)

  def __init__(self, expense_id, tag_id):
    self.expense_id = expense_id
    self.tag_id = tag_id

  def __repr__(self):
    return '<ExTaRe id=%d budget_id=%d tag_id=%d >' % (self.id, self.budget_id, self.tag_id)