from sqlalchemy.engine import Engine
from sqlalchemy import event

import time
from app import app

@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

@app.before_request
def before_request_hook():
    ''' 
      - .
    '''
    #time.sleep(.5)
    pass