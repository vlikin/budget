from app import db
from .budget import BudgetTable
from ext.user.table.user import UserTable

class BudgetUserTable(db.Model):
  __table_args__ = (
    db.ForeignKeyConstraint(['budget_id'], [BudgetTable.id], ondelete='CASCADE'),
    db.ForeignKeyConstraint(['user_id'], [UserTable.id], ondelete='CASCADE'),
    db.UniqueConstraint('budget_id', 'user_id', name='budget_user'),
  )

  id = db.Column(db.Integer, primary_key=True)
  budget_id = db.Column(db.Integer, nullable=False)
  user_id = db.Column(db.Integer, nullable=False)
  role = db.Column(db.String, nullable=False)

  roles = dict(
    none=0,
    owner=1,
    watcher=2
  )

  def get_key(search_value):
    return next((name for key, value in BudgetUserTable.roles.items() if value == search_value), None)

  def __init__(self, budget_id, user_id, role='watcher'):
    self.budget_id = budget_id
    self.user_id = user_id
    self.role = self.roles[role]

  def __repr__(self):
    return '<BudgetUser id=%d budget_id=%d user_id=%d role=%s>' % (self.id, self.budget_id, self.user_id, self.role)