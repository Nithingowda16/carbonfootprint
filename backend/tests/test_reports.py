import pytest
from datetime import date
from app.models import db, User, CarbonRecord, Goal, Achievement

def test_download_report_user_not_found(client, auth_headers, app):
    with app.app_context():
        user = User.query.filter_by(username='testuser').first()
        db.session.delete(user)
        db.session.commit()
        
    res = client.get('/api/reports/download', headers=auth_headers)
    assert res.status_code == 404

def test_download_report_empty(client, auth_headers):
    res = client.get('/api/reports/download', headers=auth_headers)
    assert res.status_code == 200
    assert res.mimetype == 'application/pdf'
    assert len(res.data) > 0

def test_download_report_populated(client, auth_headers, app):
    # Seed some data: record, goal, achievement
    with app.app_context():
        user = User.query.filter_by(username='testuser').first()
        
        # Add carbon record
        record = CarbonRecord(
            user_id=user.id,
            date=date(2026, 6, 15),
            transport_emissions=10.0,
            home_emissions=5.0,
            food_emissions=2.5,
            waste_emissions=1.0,
            total_emissions=18.5
        )
        # Add goal
        goal = Goal(
            user_id=user.id,
            category='overall',
            target_reduction_pct=10,
            target_co2=15.0,
            start_date=date(2026, 6, 1),
            end_date=date(2026, 6, 30),
            frequency='monthly',
            status='active'
        )
        # Add achievement
        badge = Achievement(
            user_id=user.id,
            badge_key='eco_warrior',
            badge_name='Eco Warrior'
        )
        db.session.add_all([record, goal, badge])
        db.session.commit()
        
    # Trigger download
    res = client.get('/api/reports/download', headers=auth_headers)
    assert res.status_code == 200
    assert res.mimetype == 'application/pdf'
    assert len(res.data) > 0
