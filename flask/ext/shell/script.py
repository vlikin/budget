from app import app, script_manager
from . import lib

@script_manager.command
def drop_all():
  '''
    -It drops all tables.
  '''
  lib.drop_all()

@script_manager.command
def init_db():
  '''
    -It creates the initial database.
  '''
  lib.init_db()

@script_manager.command
def init_test_db():
  '''
    - Fills the system by test data. It is designed for automatic tests.
  '''
  from .test_data import test_data
  lib.init_test_db(test_data)

@script_manager.command
def init_real_data_v1():
  '''
    - Fills the system by real data to test the interface by real users.
  '''
  lib.init_real_data_v1()