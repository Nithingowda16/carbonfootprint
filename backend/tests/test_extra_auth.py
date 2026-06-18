import pytest
from datetime import date, timedelta
from app.models import db, User, Achievement

def test_register_missing_fields(client):
    response = client.post('/api/auth/register', json={})
    assert response.status_code == 400
    assert response.get_json()['error'] == 'Missing required fields'

def test_register_existing_username(client):
    client.post('/api/auth/register', json={
        'username': 'user1',
        'email': 'user1@example.com',
        'password': 'password'
    })
    response = client.post('/api/auth/register', json={
        'username': 'user1',
        'email': 'user2@example.com',
        'password': 'password'
    })
    assert response.status_code == 400
    assert response.get_json()['error'] == 'Username already exists'

def test_register_existing_email(client):
    client.post('/api/auth/register', json={
        'username': 'user1',
        'email': 'user1@example.com',
        'password': 'password'
    })
    response = client.post('/api/auth/register', json={
        'username': 'user2',
        'email': 'user1@example.com',
        'password': 'password'
    })
    assert response.status_code == 400
    assert response.get_json()['error'] == 'Email already registered'

def test_login_missing_credentials(client):
    response = client.post('/api/auth/login', json={})
    assert response.status_code == 400
    assert response.get_json()['error'] == 'Missing credentials'

def test_login_streak(client, app):
    with app.app_context():
        # Create user with last_active yesterday
        user = User(username='streakuser', email='streakuser@example.com')
        user.set_password('password')
        user.last_active = date.today() - timedelta(days=1)
        user.streak = 6
        db.session.add(user)
        db.session.commit()
        
    response = client.post('/api/auth/login', json={
        'email': 'streakuser@example.com',
        'password': 'password'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['user']['streak'] == 7
    
    with app.app_context():
        u = db.session.get(User, data['user']['id'])
        # Achievement 'streak_7' should be unlocked
        achievements = [a.badge_key for a in u.achievements]
        assert 'streak_7' in achievements

def test_login_streak_reset(client, app):
    with app.app_context():
        user = User(username='streakresetuser', email='streakresetuser@example.com')
        user.set_password('password')
        user.last_active = date.today() - timedelta(days=5)
        user.streak = 5
        db.session.add(user)
        db.session.commit()
        
    response = client.post('/api/auth/login', json={
        'email': 'streakresetuser@example.com',
        'password': 'password'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['user']['streak'] == 1

def test_profile_not_found(client, auth_headers, app):
    # Delete testuser in database
    with app.app_context():
        user = User.query.filter_by(username='testuser').first()
        db.session.delete(user)
        db.session.commit()
        
    response = client.get('/api/auth/profile', headers=auth_headers)
    assert response.status_code == 404
    assert response.get_json()['error'] == 'User not found'

def test_update_profile_not_found(client, auth_headers, app):
    with app.app_context():
        user = User.query.filter_by(username='testuser').first()
        db.session.delete(user)
        db.session.commit()
        
    response = client.put('/api/auth/profile', headers=auth_headers, json={'username': 'noone'})
    assert response.status_code == 404

def test_update_profile_conflicts_and_password(client, auth_headers, app):
    with app.app_context():
        other = User(username='otheruser', email='other@example.com')
        other.set_password('password')
        db.session.add(other)
        db.session.commit()
        
    # Attempt update to taken username
    res = client.put('/api/auth/profile', headers=auth_headers, json={'username': 'otheruser'})
    assert res.status_code == 400
    assert res.get_json()['error'] == 'Username already taken'
    
    # Attempt update to taken email
    res = client.put('/api/auth/profile', headers=auth_headers, json={'email': 'other@example.com'})
    assert res.status_code == 400
    assert res.get_json()['error'] == 'Email already taken'
    
    # Successful update including email, username and password
    res = client.put('/api/auth/profile', headers=auth_headers, json={
        'username': 'newuniqueusername',
        'email': 'newunique@example.com',
        'password': 'newpassword123'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data['username'] == 'newuniqueusername'
    assert data['email'] == 'newunique@example.com'

def test_forgot_password(client, app):
    # Missing email
    res = client.post('/api/auth/forgot-password', json={})
    assert res.status_code == 400
    
    # Non-existent email
    res = client.post('/api/auth/forgot-password', json={'email': 'ghost@example.com'})
    assert res.status_code == 200
    assert 'instructions' in res.get_json()['error']
    
    # Existent email
    with app.app_context():
        user = User(username='forgotuser', email='forgot@example.com')
        user.set_password('password')
        db.session.add(user)
        db.session.commit()
        
    res = client.post('/api/auth/forgot-password', json={'email': 'forgot@example.com'})
    assert res.status_code == 200
    data = res.get_json()
    assert 'reset_token' in data

def test_reset_password(client, app):
    # Missing token/password
    res = client.post('/api/auth/reset-password', json={})
    assert res.status_code == 400
    
    # Invalid prefix
    res = client.post('/api/auth/reset-password', json={'token': 'badtoken', 'new_password': 'new'})
    assert res.status_code == 400
    assert res.get_json()['error'] == 'Invalid reset token'
    
    # Non-existent user in token
    res = client.post('/api/auth/reset-password', json={'token': 'reset-9999-99482', 'new_password': 'new'})
    assert res.status_code == 400
    assert res.get_json()['error'] == 'Invalid or expired token'
    
    # Valid reset
    with app.app_context():
        user = User(username='resetuser', email='reset@example.com')
        user.set_password('oldpassword')
        db.session.add(user)
        db.session.commit()
        user_id = user.id
        
    res = client.post('/api/auth/reset-password', json={
        'token': f'reset-{user_id}-99482',
        'new_password': 'brandnewpassword'
    })
    assert res.status_code == 200
    assert res.get_json()['message'] == 'Password reset successfully'

def test_gamification_not_found(client, auth_headers, app):
    with app.app_context():
        user = User.query.filter_by(username='testuser').first()
        db.session.delete(user)
        db.session.commit()
        
    res = client.get('/api/auth/gamification', headers=auth_headers)
    assert res.status_code == 404
