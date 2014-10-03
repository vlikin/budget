from flask import jsonify
from app import app

@app.route('/user/rest/login')
def login():
  return jsonify({})

