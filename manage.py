import settings
settings.APPLICATION_TYPE = 'script'
from app import app, script_manager

if __name__ == "__main__":
  with app.app_context():
    #from core.script import *
    script_manager.run()

