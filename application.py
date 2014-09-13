'''
  - It gets everything together.
'''
from app import app

import ext.budget

if __name__ == '__main__':
  app.run(debug=True)