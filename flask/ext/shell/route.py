from app import app

@app.route('/')
def front_route():
  return app.send_static_file('app/index.html')