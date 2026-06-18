import pytest
from datetime import date, timedelta
from app.models import db, User, CarbonRecord, Goal, Action, Challenge, UserChallenge

def test_add_record_user_not_found(client, auth_headers, app):
    with app.app_context():
        user = User.query.filter_by(username='testuser').first()
        db.session.delete(user)
        db.session.commit()
    response = client.post('/api/calculator/record', headers=auth_headers, json={})
    assert response.status_code == 404

def test_add_record_default_date_and_diets(client, auth_headers):
    # No date in request (defaults to today)
    # Different diet types: mixed
    payload = {
        'details': {
            'car_type': 'hybrid',
            'car_km': 10,
            'diet_type': 'mixed',
            'plastic_usage': 'high',
            'recycles': False,
            'composts': False
        }
    }
    response = client.post('/api/calculator/record', headers=auth_headers, json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data['record']['date'] == date.today().isoformat()
    # hybrid = 0.10 * 10 = 1.0
    # mixed = 4.5
    # waste = 0 (waste_kg) + 2.0 (high) = 2.0
    # total expected = 1.0 + 4.5 + 2.0 = 7.5
    assert data['record']['total_emissions'] == 7.5

def test_add_record_different_factors(client, auth_headers):
    # Test diesel, electric, ride_sharing, bike
    # Test vegan, heavy_meat
    # Test plastic low, recycles, composts
    # First: heavy_meat & diesel
    payload1 = {
        'details': {
            'car_type': 'diesel',
            'car_km': 10,
            'diet_type': 'heavy_meat',
            'plastic_usage': 'low',
            'recycles': True,
            'composts': False
        }
    }
    res1 = client.post('/api/calculator/record', headers=auth_headers, json=payload1)
    assert res1.status_code == 200
    # diesel = 0.17 * 10 = 1.7
    # heavy_meat = 7.2
    # waste = 0 + 0.2 (low) - 0.8 (recycles) = -0.6 -> capped at 0.0
    # total expected = 1.7 + 7.2 + 0.0 = 8.9
    assert res1.get_json()['record']['total_emissions'] == 8.9

    # Second: electric, bike, and ride_sharing
    payload2 = {
        'details': {
            'car_type': 'electric',
            'car_km': 50,
            'ride_sharing_km': 10,
            'diet_type': 'vegan',
            'plastic_usage': 'medium'
        }
    }
    res2 = client.post('/api/calculator/record', headers=auth_headers, json=payload2)
    assert res2.status_code == 200
    # electric = 0.04 * 50 = 2.0
    # ride_sharing = 0.12 * 10 = 1.2
    # vegan = 1.5
    # waste = 1.0 (medium)
    # total expected = 2.0 + 1.2 + 1.5 + 1.0 = 5.7
    assert res2.get_json()['record']['total_emissions'] == 5.7

def test_get_history(client, auth_headers):
    # Log two records
    client.post('/api/calculator/record', headers=auth_headers, json={
        'date': '2026-06-14',
        'details': {'car_km': 10}
    })
    client.post('/api/calculator/record', headers=auth_headers, json={
        'date': '2026-06-15',
        'details': {'car_km': 20}
    })
    
    response = client.get('/api/calculator/history', headers=auth_headers)
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) >= 2

def test_get_summary_no_records(client, app):
    # Register a new user and login to test empty summary
    client.post('/api/auth/register', json={
        'username': 'emptyuser',
        'email': 'empty@example.com',
        'password': 'password'
    })
    login_resp = client.post('/api/auth/login', json={
        'email': 'empty@example.com',
        'password': 'password'
    })
    token = login_resp.get_json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}
    
    response = client.get('/api/calculator/summary', headers=headers)
    assert response.status_code == 200
    assert response.get_json()['records_count'] == 0
    assert response.get_json()['carbon_score'] == 100

def test_get_summary_with_sustainability_bonuses(client, auth_headers):
    # Log record with high sustainability choices
    client.post('/api/calculator/record', headers=auth_headers, json={
        'date': '2026-06-15',
        'details': {
            'diet_type': 'vegan',
            'recycles': True,
            'composts': True,
            'renewable_pct': 80
        }
    })
    response = client.get('/api/calculator/summary', headers=auth_headers)
    assert response.status_code == 200
    data = response.get_json()
    # sustainability score should be min(100, 50 (base) + 20 (vegan) + 10 (recycles) + 10 (composts) + 10 (renewable)) = 100
    assert data['sustainability_score'] == 100

def test_goals_creation_monthly_and_annual(client, auth_headers):
    # Monthly Goal
    res_m = client.post('/api/calculator/goals', headers=auth_headers, json={
        'category': 'transport',
        'target_reduction_pct': 20,
        'frequency': 'monthly'
    })
    assert res_m.status_code == 201
    
    # Annual Goal
    res_a = client.post('/api/calculator/goals', headers=auth_headers, json={
        'category': 'home',
        'target_reduction_pct': 30,
        'frequency': 'annual'
    })
    assert res_a.status_code == 201

def test_goals_progress_calculations(client, auth_headers, app):
    # Setup past record to set baseline
    client.post('/api/calculator/record', headers=auth_headers, json={
        'date': (date.today() - timedelta(days=1)).isoformat(),
        'details': {'car_km': 100} # very high emissions
    })
    
    # Create weekly goal
    client.post('/api/calculator/goals', headers=auth_headers, json={
        'category': 'overall',
        'target_reduction_pct': 10,
        'frequency': 'weekly'
    })
    
    # Check progress (without new records within goal start/end range)
    res = client.get('/api/calculator/goals', headers=auth_headers)
    assert res.status_code == 200
    # Since start_date is today, the record logged yesterday is outside start/end date range.
    # Therefore, no records are within the goal range, progress_pct should be 0.
    
    # Let's log a record today to show active progress
    # Baseline was roughly 23 (approx for car_km=100 & default vegetarian diet).
    # If we log a very low emissions record today, actual emissions will be below target
    client.post('/api/calculator/record', headers=auth_headers, json={
        'date': date.today().isoformat(),
        'details': {'car_km': 1} # very low
    })
    
    res = client.get('/api/calculator/goals', headers=auth_headers)
    assert res.status_code == 200
    goals = res.get_json()
    assert any(g['progress_pct'] == 100 for g in goals)

def test_goal_status_evaluation_expired(client, auth_headers, app):
    # Create an expired goal
    with app.app_context():
        user = User.query.filter_by(username='testuser').first()
        # Create past record
        record = CarbonRecord(
            user_id=user.id,
            date=date.today() - timedelta(days=10),
            transport_emissions=10.0,
            total_emissions=10.0
        )
        db.session.add(record)
        # Create expired goal that succeeded
        goal_success = Goal(
            user_id=user.id,
            category='overall',
            target_reduction_pct=10,
            target_co2=15.0, # target is 15.0, actual is 10.0 (success)
            start_date=date.today() - timedelta(days=12),
            end_date=date.today() - timedelta(days=1),
            frequency='weekly',
            status='active'
        )
        # Create expired goal that failed
        goal_failed = Goal(
            user_id=user.id,
            category='overall',
            target_reduction_pct=10,
            target_co2=5.0, # target is 5.0, actual is 10.0 (failed)
            start_date=date.today() - timedelta(days=12),
            end_date=date.today() - timedelta(days=1),
            frequency='weekly',
            status='active'
        )
        db.session.add(goal_success)
        db.session.add(goal_failed)
        db.session.commit()
        
    res = client.get('/api/calculator/goals', headers=auth_headers)
    assert res.status_code == 200
    goals = res.get_json()
    # Verify they got updated to completed/failed
    completed_goal = next(g for g in goals if g['target_co2'] == 15.0)
    failed_goal = next(g for g in goals if g['target_co2'] == 5.0)
    assert completed_goal['status'] == 'completed'
    assert failed_goal['status'] == 'failed'

def test_log_action_user_not_found(client, auth_headers, app):
    with app.app_context():
        user = User.query.filter_by(username='testuser').first()
        db.session.delete(user)
        db.session.commit()
    response = client.post('/api/calculator/actions', headers=auth_headers, json={'action_key': 'walk'})
    assert response.status_code == 404

def test_log_action_difficulties_and_badges(client, auth_headers):
    # Medium difficulty
    res = client.post('/api/calculator/actions', headers=auth_headers, json={
        'action_key': 'commute_bus',
        'difficulty': 'medium'
    })
    assert res.status_code == 201
    
    # Hard difficulty
    res = client.post('/api/calculator/actions', headers=auth_headers, json={
        'action_key': 'solar_panels',
        'difficulty': 'hard'
    })
    assert res.status_code == 201

    # Check that we can list actions
    list_res = client.get('/api/calculator/actions', headers=auth_headers)
    assert list_res.status_code == 200
    assert len(list_res.get_json()) >= 2 # 2 actions logged in this test

def test_action_badges_accumulation(client, auth_headers, app):
    # Log many actions to trigger badges
    for i in range(35):
        client.post('/api/calculator/actions', headers=auth_headers, json={
            'action_key': f'action_{i}',
            'difficulty': 'easy'
        })
    
    # Retrieve gamification badges
    res = client.get('/api/auth/gamification', headers=auth_headers)
    assert res.status_code == 200
    badges = [b['badge_key'] for b in res.get_json()['badges']]
    assert 'first_action' in badges # Green Novice
    assert 'eco_warrior' in badges # Eco Warrior
    assert 'sustainability_hero' in badges # Sustainability Hero

def test_join_challenge_errors(client, auth_headers):
    # Challenge does not exist
    res = client.post('/api/calculator/challenges/join/99999', headers=auth_headers)
    assert res.status_code == 404
    
    # Duplicate join
    chals_res = client.get('/api/calculator/challenges', headers=auth_headers)
    chal_id = chals_res.get_json()[0]['id']
    
    res1 = client.post(f'/api/calculator/challenges/join/{chal_id}', headers=auth_headers)
    assert res1.status_code in [200, 201]
    
    res2 = client.post(f'/api/calculator/challenges/join/{chal_id}', headers=auth_headers)
    assert res2.status_code == 200
    assert res2.get_json()['message'] == 'Already joined'

def test_log_challenge_progress_errors_and_completion(client, auth_headers, app):
    # Join first to have a valid challenge id
    chals_res = client.get('/api/calculator/challenges', headers=auth_headers)
    chal_id = chals_res.get_json()[0]['id']
    
    # Log progress without joining
    res_err = client.post('/api/calculator/challenges/progress/99999', headers=auth_headers, json={'progress': 1.0})
    assert res_err.status_code == 404
    
    # Join challenge
    client.post(f'/api/calculator/challenges/join/{chal_id}', headers=auth_headers)
    
    # Log progress to complete it
    res_comp = client.post(f'/api/calculator/challenges/progress/{chal_id}', headers=auth_headers, json={'progress': 100.0})
    assert res_comp.status_code == 200
    assert res_comp.get_json()['status'] == 'completed'
    
    # Get joined challenges
    joined_res = client.get('/api/calculator/challenges/joined', headers=auth_headers)
    assert joined_res.status_code == 200
    assert len(joined_res.get_json()) >= 1
