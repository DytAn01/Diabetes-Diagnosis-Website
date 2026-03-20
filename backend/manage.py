"""
Flask application initialization script for running migrations and tests
"""

import os
import sys
import click
from flask.cli import FlaskGroup
from app import create_app, db

def create_app_cli(info=None):
    return create_app(os.environ.get('FLASK_ENV', 'development'))

@click.group(cls=FlaskGroup, create_app=create_app_cli)
def cli():
    """Management script for the Flask application"""
    pass

if __name__ == '__main__':
    cli()
