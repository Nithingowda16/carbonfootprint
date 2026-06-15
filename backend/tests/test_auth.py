import json

def test_register_user(client):
    response = client.post('/api/auth/register', json={
        'username': 'newuser',
        'email': 'newuser@example.com',
        'password': 'password123'
    })
    # Response code is 211 as configured in backend auth register
    assert response.status_code == 211
    data = response.get_json()
    assert 'access_token' in data
    assert data['user']['username'] == 'newuser'

def test_register_duplicate(client):
    # Register first
    client.post('/api/auth/register', json={
        'username': 'dupuser',
        'email': 'dupuser@example.com',
        'password': 'password123'
    })
    
    # Try registering again
    response = client.post('/api/auth/register', json={
        'username': 'dupuser',
        'email': 'dupuser@example.com',
        'password': 'password123'
    })
    assert response.status_code == 400
    assert 'error' in response.get_json()

def test_login_user(client):
    # Register first
    client.post('/api/auth/register', json={
        'username': 'loginuser',
        'email': 'loginuser@example.com',
        'password': 'password123'
    })
    
    response = client.post('/api/auth/login', json={
        'email': 'loginuser@example.com',
        'password': 'password123'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert 'access_token' in data

def test_login_invalid(client):
    response = client.post('/api/auth/login', json={
        'email': 'nonexistent@example.com',
        'password': 'wrongpassword'
    })
    assert response.status_code == 401

def test_get_profile(client, auth_headers):
    response = client.get('/api/auth/profile', headers=auth_headers)
    assert response.status_code == 200
    data = response.get_json()
    assert data['username'] == 'testuser'

def test_update_profile(client, auth_headers):
    response = client.put('/api/auth/profile', headers=auth_headers, json={
        'username': 'updateduser'
    })
    assert response.status_code == 200
    assert response.get_json()['username'] == 'updateduser'
