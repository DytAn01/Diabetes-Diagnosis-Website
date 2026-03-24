from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_name='development'):
    """Application factory"""
    app = Flask(__name__)
    
    from app.config import config
    app.config.from_object(config[config_name])
    
    # Enable CORS FIRST (before initializing other extensions)
    CORS(app,
         origins=['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175', 'http://127.0.0.1:5176', 'http://127.0.0.1:3000'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
         allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
         expose_headers=['Content-Type', 'Authorization'],
         supports_credentials=True,
         max_age=3600)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    from app import models
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.predict import predict_bp
    from app.routes.records import records_bp
    from app.routes.articles import articles_bp
    from app.routes.chat import chat_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(predict_bp, url_prefix='/api/predict')
    app.register_blueprint(records_bp, url_prefix='/api/records')
    app.register_blueprint(articles_bp, url_prefix='/api/articles')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    return app
