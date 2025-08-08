from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
from db import db, init_db
from routes import bp

load_dotenv()
app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True

init_db(app)
app.register_blueprint(bp)

if __name__ == "__main__":
    app.run(debug=True)