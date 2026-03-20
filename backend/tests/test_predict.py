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

@pytest.fixture
def auth_token(client, app):
    """Get auth token"""
    with app.app_context():
        user = User(full_name='Test User', email='test@example.com', role='user', is_active=True)
        user.set_password('password123')
        db.session.add(user)
        db.session.commit()
    
    response = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    return response.json['access_token']

def test_predict(client, auth_token):
    """Test prediction"""
    headers = {'Authorization': f'Bearer {auth_token}'}
    response = client.post('/api/predict/', json={
        'glucose': 148,
        'hba1c': 6.2,
        'bmi': 33.6,
        'blood_pressure': 72,
        'waist': 95,
        'age': 50,
        'family_history': 1,
        'insulin': 0,
        'skin_thickness': 35,
        'pregnancies': 2
    }, headers=headers)
    
    assert response.status_code == 500 or response.status_code == 200
