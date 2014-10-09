import settings
settings.TESTING = True
settings.SQLALCHEMY_DATABASE_URI = 'sqlite:///test.sqlite'

from application import app
import unittest

# Core.
from ext.core.test.lib.rest_auth import RestAuthTestCase

# User.
from ext.user.test.user_model import UserModelTestCase

from ext.user.test.user_model import UserModelTestCase

from ext.budget.test.budget_model import BudgetModelTestCase
from ext.budget.test.tag_model import TagModelTestCase
from ext.budget.test.expense_model import ExpenseModelTestCase
from ext.budget.test.table import TableTestCase

from ext.user.test.rest import UserRestTestCase

if __name__ == '__main__':
  unittest.main()