from app import db
from datetime import datetime
from sqlalchemy.orm import relationship

from .budget import BudgetTable

class TagTable(db.Model):
  __table_args__ = (
    db.ForeignKeyConstraint(['budget_id'], [BudgetTable.id], ondelete='CASCADE'),
    db.ForeignKeyConstraint(['parent_id'], ['tag_table.id'], ondelete='CASCADE'),
  )

  id = db.Column(db.Integer, primary_key=True)
  title = db.Column(db.String(120), unique=False)
  budget_id = db.Column(db.Integer, nullable=False)
  parent_id = db.Column(db.Integer, nullable=True)
  created = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
  updated = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

  expense_expense_bridge = relationship('ExpenseTagTable', backref='tag')

  def __init__(self, title, budget_id, parent_id):
    self.title = title
    self.budget_id = budget_id
    self.parent_id = parent_id

  def __repr__(self):
    return '<Tag id=%d budget_id=%d title=%s>' % (self.id, self.budget_id, self.title)

@db.event.listens_for(TagTable, 'before_update', propagate=True)
def timestamp_before_update(mapper, connection, target):
  target.updated = datetime.utcnow()