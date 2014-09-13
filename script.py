from app import app, script_manager

import ext.shell.script

if __name__ == "__main__":
  with app.app_context():
    script_manager.run()

