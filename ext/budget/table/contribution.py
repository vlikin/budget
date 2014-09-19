from app import db
from datetime import datetime

from .user import UserTable
from .budget import BudgetTable

class ContributionTable(db.Model):
  __table_args__ = (
    db.ForeignKeyConstraint(['budget_id'], [BudgetTable.id], ondelete='CASCADE'),
    db.ForeignKeyConstraint(['user_id'], [UserTable.id], ondelete='CASCADE'),
  )

  id = db.Column(db.Integer, primary_key=True)
  amount = db.Column(db.Integer, nullable=False)
  budget_id = db.Column(db.Integer, nullable=False)
  user_id = db.Column(db.Integer, nullable=False)
  description = db.Column(db.String, nullable=False)
  created = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
  updated = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

  def __init__(self, budget_id, user_id, amount, description=''):
    self.user_id = user_id
    self.budget_id = budget_id
    self.amount = amount
    self.description = description

  def __repr__(self):
    return '<Contribution id=%d budget_id=%d user_id=%d amount=%s>' % (self.id, self.budget_id, self.user_id, self.amount)

@db.event.listens_for(ContributionTable, 'before_update', propagate=True)
def timestamp_before_update(mapper, connection, target):
  target.updated = datetime.utcnow()