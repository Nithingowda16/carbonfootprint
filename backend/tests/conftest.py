import os
import pytest
from datetime import date
from app import create_app, db
from app.models import Challenge

@pytest.fixture
def app():
    # Set testing configuration parameters
    test_config = {
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
        'JWT_SECRET_KEY': 'test-jwt-secret-key-12345-long-enough-32-chars',
        'SECRET_KEY': 'test-secret-key',
        'WTF_CSRF_ENABLED': False
    }
    
    app = create_app(test_config)
    
    with app.app_context():
        # Setup tables and seed challenges for testing
        db.create_all()
        
        # Add basic test challenges if not already seeded
        if not Challenge.query.filter_by(title="Test Challenge").first():
            test_chal = Challenge(
                title="Test Challenge",
                description="Test description",
                target_value=5.0,
                challenge_type="transport",
                start_date=date(2026, 6, 1),
                end_date=date(2026, 12, 31),
                xp_reward=50,
                points_reward=10
            )
            db.session.add(test_chal)
            db.session.commit()
            
        yield app
        
        # Teardown
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_headers(client):
    # Register and login a default test user
    client.post('/api/auth/register', json={
        'username': 'testuser',
        'email': 'testuser@example.com',
        'password': 'password123'
    })
    
    response = client.post('/api/auth/login', json={
        'email': 'testuser@example.com',
        'password': 'password123'
    })
    
    access_token = response.get_json()['access_token']
    return {
        'Authorization': f'Bearer {access_token}'
    }
