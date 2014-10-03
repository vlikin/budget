from app import db
from sqlalchemy.orm import relationship

class UserTable(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  email = db.Column(db.String(120), unique=True)
  password = db.Column(db.String)
  username = db.Column(db.String(80), unique=False)

  budget_user_bridge = relationship('BudgetUserTable', backref='user')
  contribution_bridge = relationship('ContributionTable', backref='user')
  expense_bridge = relationship('ExpenseTable', backref='user')

  def __init__(self, email, password):
    self.email = email
    self.password = password

  def __repr__(self):
    return '<User id=%d email=%s username=%s>' % (self.id, self.email, self.username)