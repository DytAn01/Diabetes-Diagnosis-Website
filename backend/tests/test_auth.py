import pytest
from app import create_app, db
from app.models.user import User

@pytest.fixture
def app():
    """Create app for testing"""
    app = create_app('testing')
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """Test client"""
    return app.test_client()

def test_register(client):
    """Test user registration"""
    response = client.post('/api/auth/register', json={
        'full_name': 'Test User',
        'email': 'test@example.com',
        'password': 'password123'
    })
    assert response.status_code == 201
    assert response.json['user']['email'] == 'test@example.com'

def test_login(client, app):
    """Test user login"""
    with app.app_context():
        user = User(full_name='Test User', email='test@example.com', role='user', is_active=True)
        user.set_password('password123')
        db.session.add(user)
        db.session.commit()
    
    response = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    assert response.status_code == 200
    assert 'access_token' in response.json
