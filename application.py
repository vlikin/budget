'''
  - It gets everything together.
'''
from app import app

# Routes.
import ext.shell.route

if __name__ == '__main__':
  app.run(debug=True)