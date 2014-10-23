import time
from app import app

@app.before_request
def before_request_hook():
    ''' 
      - .
    '''
    #time.sleep(.5)
    pass