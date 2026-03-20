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
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)

    from app import models
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.predict import predict_bp
    from app.routes.records import records_bp
    from app.routes.articles import articles_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(predict_bp, url_prefix='/api/predict')
    app.register_blueprint(records_bp, url_prefix='/api/records')
    app.register_blueprint(articles_bp, url_prefix='/api/articles')
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    return app
