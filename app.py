from flask import Flask

import settings

app = Flask(__name__)
app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'
app.config.from_object(settings)

from flask.ext.sqlalchemy import SQLAlchemy
db = SQLAlchemy(app)

from flask.ext.script import Manager as ScriptManager
script_manager = ScriptManager(app)

# REST.
import ext.user.rest
import ext.budget.rest

# Hooks.
import ext.core.hook

if __name__ == '__main__':
  app.run(debug=True)
