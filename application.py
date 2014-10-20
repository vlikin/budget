'''
  - It gets everything together.
'''
from app import app

import ext.core.hook

# Routes.
import ext.shell.route

if __name__ == '__main__':
  app.run(debug=True)