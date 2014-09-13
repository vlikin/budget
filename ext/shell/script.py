from app import app, script_manager
from . import lib

@script_manager.command
def drop_all():
  '''It drops all tables.'''
  lib.drop_all()

@script_manager.command
def init_db():
  '''It creates the initial database.'''
  lib.init_db()