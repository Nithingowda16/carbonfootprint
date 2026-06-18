from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='user', nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Gamification
    xp = db.Column(db.Integer, default=0, nullable=False)
    level = db.Column(db.Integer, default=1, nullable=False)
    streak = db.Column(db.Integer, default=0, nullable=False)
    green_points = db.Column(db.Integer, default=0, nullable=False)
    last_active = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    carbon_records = db.relationship('CarbonRecord', backref='user', lazy=True, cascade="all, delete-orphan")
    goals = db.relationship('Goal', backref='user', lazy=True, cascade="all, delete-orphan")
    actions = db.relationship('Action', backref='user', lazy=True, cascade="all, delete-orphan")
    user_challenges = db.relationship('UserChallenge', backref='user', lazy=True, cascade="all, delete-orphan")
    chat_histories = db.relationship('ChatHistory', backref='user', lazy=True, cascade="all, delete-orphan")
    achievements = db.relationship('Achievement', backref='user', lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat(),
            'xp': self.xp,
            'level': self.level,
            'streak': self.streak,
            'green_points': self.green_points,
            'last_active': self.last_active.isoformat()
        }

class CarbonRecord(db.Model):
    __tablename__ = 'carbon_records'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    date = db.Column(db.Date, nullable=False, index=True)
    
    transport_emissions = db.Column(db.Float, default=0.0, nullable=False)
    home_emissions = db.Column(db.Float, default=0.0, nullable=False)
    food_emissions = db.Column(db.Float, default=0.0, nullable=False)
    waste_emissions = db.Column(db.Float, default=0.0, nullable=False)
    total_emissions = db.Column(db.Float, default=0.0, nullable=False)
    
    # Stores inputs as structured JSON (e.g., car_km, flight_km, electricity_kwh, diet_type)
    details = db.Column(db.JSON, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'date': self.date.isoformat(),
            'transport_emissions': self.transport_emissions,
            'home_emissions': self.home_emissions,
            'food_emissions': self.food_emissions,
            'waste_emissions': self.waste_emissions,
            'total_emissions': self.total_emissions,
            'details': self.details
        }

class Goal(db.Model):
    __tablename__ = 'goals'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    category = db.Column(db.String(50), default='overall', nullable=False) # overall, transport, home, food, waste
    target_reduction_pct = db.Column(db.Float, nullable=False)
    target_co2 = db.Column(db.Float, nullable=False) # absolute co2 target limit
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    frequency = db.Column(db.String(20), nullable=False) # weekly, monthly, annual
    status = db.Column(db.String(20), default='active', nullable=False) # active, completed, failed

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'category': self.category,
            'target_reduction_pct': self.target_reduction_pct,
            'target_co2': self.target_co2,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'frequency': self.frequency,
            'status': self.status
        }

class Action(db.Model):
    __tablename__ = 'actions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    action_key = db.Column(db.String(100), nullable=False) # e.g. walk_short, turn_off_appliances
    action_type = db.Column(db.String(50), nullable=False) # transport, home, food, waste
    carbon_reduction = db.Column(db.Float, nullable=False) # kg CO2 reduced per completion
    money_saved = db.Column(db.Float, nullable=False) # estimated money saved ($)
    difficulty = db.Column(db.String(20), nullable=False) # easy, medium, hard
    status = db.Column(db.String(20), default='pending', nullable=False) # pending, completed
    completed_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action_key': self.action_key,
            'action_type': self.action_type,
            'carbon_reduction': self.carbon_reduction,
            'money_saved': self.money_saved,
            'difficulty': self.difficulty,
            'status': self.status,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

class Challenge(db.Model):
    __tablename__ = 'challenges'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(256), nullable=False)
    target_value = db.Column(db.Float, nullable=False) # e.g. save 10kg CO2, or walk 5 times
    challenge_type = db.Column(db.String(50), nullable=False) # transport, home, food, waste, general
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    xp_reward = db.Column(db.Integer, default=50, nullable=False)
    points_reward = db.Column(db.Integer, default=10, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'target_value': self.target_value,
            'challenge_type': self.challenge_type,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'xp_reward': self.xp_reward,
            'points_reward': self.points_reward
        }

class UserChallenge(db.Model):
    __tablename__ = 'user_challenges'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    challenge_id = db.Column(db.Integer, db.ForeignKey('challenges.id', ondelete='CASCADE'), nullable=False, index=True)
    progress = db.Column(db.Float, default=0.0, nullable=False)
    status = db.Column(db.String(20), default='joined', nullable=False) # joined, completed
    joined_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Establish direct relationship helper
    challenge = db.relationship('Challenge', backref='user_assignments')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'challenge_id': self.challenge_id,
            'progress': self.progress,
            'status': self.status,
            'joined_at': self.joined_at.isoformat(),
            'challenge': self.challenge.to_dict() if self.challenge else None
        }

class ChatHistory(db.Model):
    __tablename__ = 'chat_history'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    message = db.Column(db.Text, nullable=False)
    sender = db.Column(db.String(20), nullable=False) # user or bot
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'message': self.message,
            'sender': self.sender,
            'timestamp': self.timestamp.isoformat()
        }

class Achievement(db.Model):
    __tablename__ = 'achievements'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    badge_key = db.Column(db.String(50), nullable=False) # first_step, eco_warrior, etc.
    badge_name = db.Column(db.String(100), nullable=False) # "First Green Step", "Eco Warrior"
    unlocked_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'badge_key': self.badge_key,
            'badge_name': self.badge_name,
            'unlocked_at': self.unlocked_at.isoformat()
        }
