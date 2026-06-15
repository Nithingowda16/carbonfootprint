import json
from datetime import date

def test_add_carbon_record(client, auth_headers):
    payload = {
        'date': '2026-06-15',
        'details': {
            'car_type': 'petrol',
            'car_km': 50,
            'bus_km': 10,
            'train_km': 0,
            'flight_km': 0,
            'ride_sharing_km': 0,
            'electricity_kwh': 10,
            'ac_hours': 4,
            'renewable_pct': 50,
            'appliance_runs': 2,
            'diet_type': 'vegetarian',
            'waste_kg': 5,
            'plastic_usage': 'medium',
            'recycles': True,
            'composts': True
        }
    }
    response = client.post('/api/calculator/record', headers=auth_headers, json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert 'record' in data
    assert data['record']['total_emissions'] > 0
    # Veg diet = 2.5, Car petrol 50km = 9.0, Bus 10km = 0.8, elec net = 2.25, ac 4h = 3.6, appliance = 0.4
    # waste = 2.5 + 1.0 - 0.8 - 1.2 = 1.5
    # total expected = 2.5 + 9.0 + 0.8 + 2.25 + 3.6 + 0.4 + 1.5 = 20.05
    assert data['record']['total_emissions'] == 20.05

def test_get_carbon_summary(client, auth_headers):
    # Log a record first
    client.post('/api/calculator/record', headers=auth_headers, json={
        'date': '2026-06-15',
        'details': {'car_km': 10, 'electricity_kwh': 5, 'diet_type': 'vegan'}
    })
    
    response = client.get('/api/calculator/summary', headers=auth_headers)
    assert response.status_code == 200
    data = response.get_json()
    assert data['records_count'] == 1
    assert data['carbon_score'] > 0

def test_create_and_get_goals(client, auth_headers):
    response = client.post('/api/calculator/goals', headers=auth_headers, json={
        'category': 'overall',
        'target_reduction_pct': 15,
        'frequency': 'weekly'
    })
    assert response.status_code == 201
    
    # Get goals list
    get_resp = client.get('/api/calculator/goals', headers=auth_headers)
    assert get_resp.status_code == 200
    assert len(get_resp.get_json()) == 1

def test_log_action(client, auth_headers):
    response = client.post('/api/calculator/actions', headers=auth_headers, json={
        'action_key': 'walk_short',
        'action_type': 'transport',
        'carbon_reduction': 1.2,
        'money_saved': 1.5,
        'difficulty': 'easy'
    })
    assert response.status_code == 201
    assert response.get_json()['action']['action_key'] == 'walk_short'

def test_challenges_flow(client, auth_headers):
    # List challenges
    list_resp = client.get('/api/calculator/challenges', headers=auth_headers)
    assert list_resp.status_code == 200
    chals = list_resp.get_json()
    assert len(chals) > 0
    test_chal_id = chals[0]['id']
    
    # Join challenge
    join_resp = client.post(f'/api/calculator/challenges/join/{test_chal_id}', headers=auth_headers)
    assert join_resp.status_code in [200, 201]
    
    # Log progress
    progress_resp = client.post(f'/api/calculator/challenges/progress/{test_chal_id}', headers=auth_headers, json={
        'progress': 2.0
    })
    assert progress_resp.status_code == 200
    assert progress_resp.get_json()['progress'] == 2.0
