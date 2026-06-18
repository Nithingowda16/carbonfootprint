import pytest
from app.models import db, CarbonRecord

def test_recommendations_no_records(client, auth_headers):
    res = client.get('/api/recommendations/', headers=auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data['highest_category'] == 'home'
    assert len(data['recommendations']) > 0
    assert any('AC usage' in r['title'] for r in data['recommendations'])

def test_recommendations_transport_highest(client, auth_headers):
    # Log a transport heavy record
    client.post('/api/calculator/record', headers=auth_headers, json={
        'date': '2026-06-15',
        'details': {'car_km': 500} # high transport
    })
    res = client.get('/api/recommendations/', headers=auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data['highest_category'] == 'transport'
    assert any('Bus' in r['title'] for r in data['recommendations'])

def test_recommendations_food_highest(client, auth_headers):
    # Log a food heavy record
    client.post('/api/calculator/record', headers=auth_headers, json={
        'date': '2026-06-15',
        'details': {'diet_type': 'heavy_meat'} # high food
    })
    res = client.get('/api/recommendations/', headers=auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data['highest_category'] == 'food'
    assert any('Meat-Free' in r['title'] for r in data['recommendations'])

def test_recommendations_waste_highest(client, auth_headers):
    # Log a waste heavy record
    client.post('/api/calculator/record', headers=auth_headers, json={
        'date': '2026-06-15',
        'details': {'waste_kg': 100, 'plastic_usage': 'high'} # high waste
    })
    res = client.get('/api/recommendations/', headers=auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data['highest_category'] == 'waste'
    assert any('composting' in r['title'] for r in data['recommendations'])
