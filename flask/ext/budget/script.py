from app import script_manager

@script_manager.command
def hello():
    "Just say hello"
    print "hello"