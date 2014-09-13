from app import db

def init_db():
  '''
    - It initialize the database at the first time. Be careful.
  '''
  import ext.budget.table
  db.drop_all()
  db.create_all()

def drop_all():
  '''
    - It drops the database at the first time. Be careful.
  '''
  db.drop_all()