from flask import request
import sqlite3
import os

SECRET_API_KEY = os.environ.get('SECRET_API_KEY')

def get_user():
    user_id = request.args.get('id')
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
    return cursor.fetchall()
