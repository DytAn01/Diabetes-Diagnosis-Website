#!/usr/bin/env python
"""
Setup MySQL database for Diabetes Diagnosis application
Run: python setup_mysql.py
"""
import pymysql
import os
from dotenv import load_dotenv
from app import create_app, db

load_dotenv()

# Database credentials from .env
DB_HOST = 'localhost'
DB_USER = 'root'
DB_PASSWORD = 'Tanle1298'
DB_NAME = 'diabetes_db'
DB_PORT = 3306

def create_database():
    """Create MySQL database if it doesn't exist"""
    try:
        # Connect to MySQL server without specifying database
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT,
            charset='utf8mb4'
        )
        
        cursor = connection.cursor()
        
        # Create database with UTF-8 support
        create_db_sql = f"""
        CREATE DATABASE IF NOT EXISTS {DB_NAME}
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci;
        """
        cursor.execute(create_db_sql)
        print(f"[OK] Database '{DB_NAME}' created/verified")
        
        cursor.close()
        connection.commit()
        connection.close()
        
        return True
    except pymysql.MySQLError as e:
        print(f"[ERROR] MySQL connection failed: {e}")
        print("\nPlease ensure:")
        print("1. MySQL server is running")
        print("2. Credentials in .env are correct (user=root, password=Tanle1298)")
        print("3. MySQL is accessible on localhost:3306")
        return False

def create_tables():
    """Create database tables using SQLAlchemy"""
    try:
        app = create_app()
        app.app_context().push()
        
        print("[...] Creating database tables...")
        db.create_all()
        print("[OK] All tables created successfully")
        
        return True
    except Exception as e:
        print(f"[ERROR] Failed to create tables: {e}")
        return False

if __name__ == '__main__':
    print("🔧 Setting up MySQL Database...\n")
    
    print("Step 1: Creating database...")
    if not create_database():
        exit(1)
    
    print("\nStep 2: Creating tables...")
    if not create_tables():
        exit(1)
    
    print("\n✅ MySQL setup completed successfully!")
    print(f"Database: {DB_NAME}")
    print(f"Host: {DB_HOST}:{DB_PORT}")
    print("\nYou can now start the backend with: python run.py")
