from datetime import datetime, date, timedelta, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, User, CarbonRecord, Goal, Action, Challenge, UserChallenge, Achievement

calculator_bp = Blueprint('calculator', __name__)

# Emission Factors (kg CO2 per unit)
TRANSPORT_FACTORS = {
    'car_petrol': 0.18,
    'car_diesel': 0.17,
    'car_hybrid': 0.10,
    'car_electric': 0.04,
    'bus': 0.08,
    'train': 0.04,
    'flight': 0.25,
    'ride_sharing': 0.12,
    'bike': 0.0
}

DIET_FACTORS = {
    'vegan': 1.5,       # kg per day
    'vegetarian': 2.5,  # kg per day
    'mixed': 4.5,       # kg per day
    'heavy_meat': 7.2   # kg per day
}

ENERGY_FACTORS = {
    'electricity_kwh': 0.45,  # kg per kWh
    'ac_hour': 0.9,           # kg per hour
    'appliance_run': 0.2      # kg per run
}

WASTE_FACTORS = {
    'waste_kg': 0.5,         # kg per kg of waste
    'plastic_high': 2.0,     # kg per day
    'plastic_medium': 1.0,   # kg per day
    'plastic_low': 0.2,      # kg per day
    'recycling_offset': -0.8,# reduction per day if recycling
    'composting_offset': -1.2# reduction per day if composting
}

def calculate_co2(details):
    # Transportation
    trans_type = details.get('car_type', 'car_petrol')
    car_km = float(details.get('car_km', 0))
    bus_km = float(details.get('bus_km', 0))
    train_km = float(details.get('train_km', 0))
    flight_km = float(details.get('flight_km', 0))
    ride_sharing_km = float(details.get('ride_sharing_km', 0))
    
    transport_co2 = (
        (car_km * TRANSPORT_FACTORS.get(f"car_{trans_type}", TRANSPORT_FACTORS['car_petrol'])) +
        (bus_km * TRANSPORT_FACTORS['bus']) +
        (train_km * TRANSPORT_FACTORS['train']) +
        (flight_km * TRANSPORT_FACTORS['flight']) +
        (ride_sharing_km * TRANSPORT_FACTORS['ride_sharing'])
    )

    # Home Energy
    elec_kwh = float(details.get('electricity_kwh', 0))
    ac_hours = float(details.get('ac_hours', 0))
    renewable_pct = float(details.get('renewable_pct', 0)) / 100.0
    appliance_runs = float(details.get('appliance_runs', 0))
    
    gross_elec_co2 = elec_kwh * ENERGY_FACTORS['electricity_kwh']
    net_elec_co2 = gross_elec_co2 * (1.0 - renewable_pct)
    
    energy_co2 = (
        net_elec_co2 +
        (ac_hours * ENERGY_FACTORS['ac_hour']) +
        (appliance_runs * ENERGY_FACTORS['appliance_run'])
    )

    # Food Diet
    diet_type = details.get('diet_type', 'mixed')
    food_co2 = DIET_FACTORS.get(diet_type, DIET_FACTORS['mixed'])

    # Waste
    waste_kg = float(details.get('waste_kg', 0))
    plastic_level = details.get('plastic_usage', 'medium')
    recycles = details.get('recycles', False)
    composts = details.get('composts', False)
    
    waste_co2 = (
        (waste_kg * WASTE_FACTORS['waste_kg']) +
        WASTE_FACTORS.get(f"plastic_{plastic_level}", WASTE_FACTORS['plastic_medium'])
    )
    if recycles:
        waste_co2 += WASTE_FACTORS['recycling_offset']
    if composts:
        waste_co2 += WASTE_FACTORS['composting_offset']
        
    # Prevent negative emissions
    waste_co2 = max(0.0, waste_co2)

    return round(transport_co2, 2), round(energy_co2, 2), round(food_co2, 2), round(waste_co2, 2)


@calculator_bp.route('/record', methods=['POST'])
@jwt_required()
def add_record():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    record_date_str = data.get('date')
    if record_date_str:
        record_date = datetime.strptime(record_date_str, '%Y-%m-%d').date()
    else:
        record_date = date.today()

    details = data.get('details', {})
    
    # Calculate emissions
    t_co2, e_co2, f_co2, w_co2 = calculate_co2(details)
    total_co2 = round(t_co2 + e_co2 + f_co2 + w_co2, 2)
    
    # Check for existing record for this date
    record = CarbonRecord.query.filter_by(user_id=user_id, date=record_date).first()
    if record:
        record.transport_emissions = t_co2
        record.home_emissions = e_co2
        record.food_emissions = f_co2
        record.waste_emissions = w_co2
        record.total_emissions = total_co2
        record.details = details
    else:
        record = CarbonRecord(
            user_id=user_id,
            date=record_date,
            transport_emissions=t_co2,
            home_emissions=e_co2,
            food_emissions=f_co2,
            waste_emissions=w_co2,
            total_emissions=total_co2,
            details=details
        )
        db.session.add(record)
        
    # Award gamification reward points
    user.xp += 20
    user.green_points += 5
    
    # Level Up logic (each level requires Level * 100 XP)
    xp_needed = user.level * 100
    if user.xp >= xp_needed:
        user.level += 1
        user.xp = user.xp - xp_needed
        # Add Level badge
        level_badge = Achievement(
            user_id=user.id,
            badge_key=f"level_{user.level}",
            badge_name=f"Eco Level {user.level}"
        )
        db.session.add(level_badge)

    db.session.commit()
    
    # Return calculated result
    return jsonify({
        'message': 'Record stored successfully',
        'record': record.to_dict(),
        'user': user.to_dict()
    }), 200


@calculator_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    user_id = int(get_jwt_identity())
    records = CarbonRecord.query.filter_by(user_id=user_id).order_by(CarbonRecord.date.desc()).limit(30).all()
    return jsonify([r.to_dict() for r in records]), 200


@calculator_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_summary():
    user_id = int(get_jwt_identity())
    records = CarbonRecord.query.filter_by(user_id=user_id).all()
    
    if not records:
        return jsonify({
            'total_emissions': 0,
            'transport_emissions': 0,
            'home_emissions': 0,
            'food_emissions': 0,
            'waste_emissions': 0,
            'carbon_score': 100, # higher is better/cleaner
            'sustainability_score': 100,
            'records_count': 0
        }), 200
        
    total_t = sum(r.transport_emissions for r in records)
    total_h = sum(r.home_emissions for r in records)
    total_f = sum(r.food_emissions for r in records)
    total_w = sum(r.waste_emissions for r in records)
    grand_total = total_t + total_h + total_f + total_w
    count = len(records)
    
    avg_emissions = grand_total / count
    
    # Carbon Score (0 to 100). Baseline average daily target is roughly 10 kg CO2.
    # 0 kg daily = 100 score. 30 kg daily or more = 0 score.
    carbon_score = max(0, min(100, int(100 - (avg_emissions * 3.3))))
    
    # Sustainability score based on diet, waste offset, and renewable energy
    latest_record = CarbonRecord.query.filter_by(user_id=user_id).order_by(CarbonRecord.date.desc()).first()
    s_score = 50
    if latest_record and latest_record.details:
        d = latest_record.details
        if d.get('diet_type') == 'vegan':
            s_score += 20
        elif d.get('diet_type') == 'vegetarian':
            s_score += 15
        if d.get('recycles'):
            s_score += 10
        if d.get('composts'):
            s_score += 10
        if float(d.get('renewable_pct', 0)) > 50:
            s_score += 10
        
    sustainability_score = min(100, s_score)
    
    return jsonify({
        'total_emissions': round(grand_total, 2),
        'avg_emissions': round(avg_emissions, 2),
        'transport_emissions': round(total_t, 2),
        'home_emissions': round(total_h, 2),
        'food_emissions': round(total_f, 2),
        'waste_emissions': round(total_w, 2),
        'carbon_score': carbon_score,
        'sustainability_score': sustainability_score,
        'records_count': count
    }), 200


@calculator_bp.route('/goals', methods=['POST'])
@jwt_required()
def create_goal():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    category = data.get('category', 'overall')
    target_reduction_pct = float(data.get('target_reduction_pct', 10))
    frequency = data.get('frequency', 'weekly') # weekly, monthly, annual
    
    today = date.today()
    if frequency == 'weekly':
        end_date = today + timedelta(days=7)
    elif frequency == 'monthly':
        end_date = today + timedelta(days=30)
    else:
        end_date = today + timedelta(days=365)
        
    # Baseline: estimate current avg emissions from past records
    records = CarbonRecord.query.filter_by(user_id=user_id).all()
    if records:
        avg_emissions = sum(r.total_emissions for r in records) / len(records)
    else:
        avg_emissions = 15.0 # default baseline
        
    # Target CO2 limit per day (reduced by the percentage)
    target_co2 = avg_emissions * (1.0 - (target_reduction_pct / 100.0))
    
    goal = Goal(
        user_id=user_id,
        category=category,
        target_reduction_pct=target_reduction_pct,
        target_co2=round(target_co2, 2),
        start_date=today,
        end_date=end_date,
        frequency=frequency,
        status='active'
    )
    db.session.add(goal)
    db.session.commit()
    
    return jsonify(goal.to_dict()), 201


@calculator_bp.route('/goals', methods=['GET'])
@jwt_required()
def get_goals():
    user_id = int(get_jwt_identity())
    goals = Goal.query.filter_by(user_id=user_id).all()
    
    # Calculate progress for each goal dynamically
    updated_goals = []
    for goal in goals:
        # Check actual emissions during the goal duration
        records = CarbonRecord.query.filter(
            CarbonRecord.user_id == user_id,
            CarbonRecord.date >= goal.start_date,
            CarbonRecord.date <= goal.end_date
        ).all()
        
        goal_dict = goal.to_dict()
        if not records:
            goal_dict['progress_pct'] = 0
            goal_dict['avg_current_emissions'] = 0
            goal_dict['predicted_success_rate'] = 50
        else:
            avg_current = sum(r.total_emissions for r in records) / len(records)
            goal_dict['avg_current_emissions'] = round(avg_current, 2)
            
            # Progress based on target
            if avg_current <= goal.target_co2:
                goal_dict['progress_pct'] = 100
                goal_dict['predicted_success_rate'] = 90
            else:
                pct = max(0, int(100 - ((avg_current - goal.target_co2) / goal.target_co2 * 100)))
                goal_dict['progress_pct'] = min(99, pct)
                goal_dict['predicted_success_rate'] = min(85, pct)
                
            # If end_date passed, update status
            if date.today() > goal.end_date and goal.status == 'active':
                if avg_current <= goal.target_co2:
                    goal.status = 'completed'
                    # Award level rewards
                    u = db.session.get(User, user_id)
                    u.xp += 150
                    u.green_points += 40
                    db.session.add(Achievement(user_id=user_id, badge_key="goal_champion", badge_name="Goal Champion"))
                else:
                    goal.status = 'failed'
                db.session.commit()
                goal_dict['status'] = goal.status
                
        updated_goals.append(goal_dict)
        
    return jsonify(updated_goals), 200


@calculator_bp.route('/actions', methods=['POST'])
@jwt_required()
def log_action():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    data = request.get_json() or {}
    action_key = data.get('action_key')
    action_type = data.get('action_type', 'general')
    reduction = float(data.get('carbon_reduction', 1.0))
    savings = float(data.get('money_saved', 0.5))
    difficulty = data.get('difficulty', 'easy')
    
    action = Action(
        user_id=user_id,
        action_key=action_key,
        action_type=action_type,
        carbon_reduction=reduction,
        money_saved=savings,
        difficulty=difficulty,
        status='completed',
        completed_at=datetime.now(timezone.utc)
    )
    
    # Award gamification reward points
    xp_earned = 15 if difficulty == 'easy' else (30 if difficulty == 'medium' else 50)
    gp_earned = 5 if difficulty == 'easy' else (10 if difficulty == 'medium' else 20)
    
    user.xp += xp_earned
    user.green_points += gp_earned
    
    # Check for Action badge
    action_count = Action.query.filter_by(user_id=user_id, status='completed').count() + 1
    if action_count == 1:
        db.session.add(Achievement(user_id=user_id, badge_key="first_action", badge_name="Green Novice"))
    elif action_count == 10:
        db.session.add(Achievement(user_id=user_id, badge_key="eco_warrior", badge_name="Eco Warrior"))
    elif action_count == 30:
        db.session.add(Achievement(user_id=user_id, badge_key="sustainability_hero", badge_name="Sustainability Hero"))
        
    db.session.add(action)
    db.session.commit()
    
    return jsonify({
        'message': 'Action completed successfully',
        'action': action.to_dict(),
        'user': user.to_dict()
    }), 201


@calculator_bp.route('/actions', methods=['GET'])
@jwt_required()
def get_actions():
    user_id = int(get_jwt_identity())
    actions = Action.query.filter_by(user_id=user_id).order_by(Action.completed_at.desc()).all()
    return jsonify([a.to_dict() for a in actions]), 200


@calculator_bp.route('/challenges', methods=['GET'])
@jwt_required()
def list_challenges():
    challenges = Challenge.query.all()
    return jsonify([c.to_dict() for c in challenges]), 200


@calculator_bp.route('/challenges/join/<int:challenge_id>', methods=['POST'])
@jwt_required()
def join_challenge(challenge_id):
    user_id = int(get_jwt_identity())
    challenge = db.session.get(Challenge, challenge_id)
    if not challenge:
        return jsonify({'error': 'Challenge not found'}), 404
        
    # Check if already joined
    existing = UserChallenge.query.filter_by(user_id=user_id, challenge_id=challenge_id).first()
    if existing:
        return jsonify({'message': 'Already joined', 'user_challenge': existing.to_dict()}), 200
        
    uc = UserChallenge(
        user_id=user_id,
        challenge_id=challenge_id,
        progress=0.0,
        status='joined'
    )
    db.session.add(uc)
    db.session.commit()
    return jsonify(uc.to_dict()), 201


@calculator_bp.route('/challenges/progress/<int:challenge_id>', methods=['POST'])
@jwt_required()
def log_challenge_progress(challenge_id):
    user_id = int(get_jwt_identity())
    uc = UserChallenge.query.filter_by(user_id=user_id, challenge_id=challenge_id).first()
    if not uc:
        return jsonify({'error': 'Challenge assignment not found. Join the challenge first.'}), 404
        
    data = request.get_json() or {}
    increment = float(data.get('progress', 1.0))
    
    uc.progress += increment
    challenge = uc.challenge
    
    if uc.progress >= challenge.target_value:
        uc.progress = challenge.target_value
        uc.status = 'completed'
        
        # Award completion rewards
        user = db.session.get(User, user_id)
        user.xp += challenge.xp_reward
        user.green_points += challenge.points_reward
        
        # Check level up
        xp_needed = user.level * 100
        if user.xp >= xp_needed:
            user.level += 1
            user.xp -= xp_needed
            db.session.add(Achievement(user_id=user_id, badge_key=f"level_{user.level}", badge_name=f"Eco Level {user.level}"))
            
        # Add badge specifically for challenge
        badge = Achievement(
            user_id=user_id,
            badge_key=f"challenge_{challenge_id}",
            badge_name=f"Challenger: {challenge.title}"
        )
        db.session.add(badge)
        
    db.session.commit()
    return jsonify(uc.to_dict()), 200


@calculator_bp.route('/challenges/joined', methods=['GET'])
@jwt_required()
def get_joined_challenges():
    user_id = int(get_jwt_identity())
    uc_list = UserChallenge.query.filter_by(user_id=user_id).all()
    return jsonify([uc.to_dict() for uc in uc_list]), 200
