from flask import jsonify
from app import app

@app.route('/user/rest/login', methods=['GET', 'POST'])
def login():
  return jsonify({'ok': 'ok'})

