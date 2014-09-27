import settings
settings.TESTING = True
settings.SQLALCHEMY_DATABASE_URI = 'sqlite:///test.sqlite'

from application import app
import unittest

#from ext.budget.test.user_model import UserModelTestCase
from ext.budget.test.budget_model import BudgetModelTestCase
from ext.budget.test.tag_model import TagModelTestCase
from ext.budget.test.expense_model import ExpenseModelTestCase
#from ext.budget.test.table import TableTestCase

if __name__ == '__main__':
  unittest.main()