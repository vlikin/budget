from app import db
from datetime import datetime
from sqlalchemy.orm import relationship

class BudgetTable(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  title = db.Column(db.String(120), unique=True)
  created = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
  updated = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

  user_budget_bridge = relationship('BudgetUserTable', backref='budget')
  tag_bridge = relationship('TagTable', backref='budget')
  contribution_bridge = relationship('ContributionTable', backref='budget')
  expense_bridge = relationship('ExpenseTable', backref='budget')

  def __init__(self, title):
    self.title = title

  def __repr__(self):
    return '<Budget id=%d title=%s>' % (self.id, self.title)

@db.event.listens_for(BudgetTable, 'before_update', propagate=True)
def timestamp_before_update(mapper, connection, target):
  target.updated = datetime.utcnow()