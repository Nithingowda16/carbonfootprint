import os
from datetime import date

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from app.models import Challenge, db

# Create limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
)


def create_app(test_config=None):
    # Calculate absolute path to frontend/dist dynamically
    base_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(os.path.dirname(base_dir))
    static_folder = os.path.join(root_dir, "frontend", "dist")

    app = Flask(
        __name__, static_folder=static_folder, static_url_path="/static_placeholder"
    )

    # Configuration
    if test_config:
        app.config.update(test_config)
    else:
        # Load environment variables
        app.config["SECRET_KEY"] = os.environ.get(
            "SECRET_KEY", "dev-secret-key-change-in-prod"
        )
        app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
            "DATABASE_URL", "sqlite:///ecotrack.db"
        )
        if app.config["SQLALCHEMY_DATABASE_URI"].startswith("postgres://"):
            app.config["SQLALCHEMY_DATABASE_URI"] = app.config[
                "SQLALCHEMY_DATABASE_URI"
            ].replace("postgres://", "postgresql://", 1)

        app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
        app.config["JWT_SECRET_KEY"] = os.environ.get(
            "JWT_SECRET_KEY", "jwt-dev-secret-key"
        )
        app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 86400  # 1 day

    # Initialize extensions securely (restrict origins in production)
    if os.environ.get("FLASK_ENV") == "production":
        CORS(app, resources={r"/api/*": {"origins": []}})
    else:
        CORS(
            app,
            resources={
                r"/api/*": {
                    "origins": [
                        "http://localhost:5173",
                        "http://127.0.0.1:5173",
                        "http://localhost:5000",
                        "http://127.0.0.1:5000",
                    ]
                }
            },
        )
    db.init_app(app)
    JWTManager(app)
    limiter.init_app(app)

    # Register Blueprints
    from app.auth import auth_bp
    from app.calculator import calculator_bp
    from app.chatbot import chatbot_bp
    from app.recommendations import recommendations_bp
    from app.reports import reports_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(calculator_bp, url_prefix="/api/calculator")
    app.register_blueprint(recommendations_bp, url_prefix="/api/recommendations")
    app.register_blueprint(chatbot_bp, url_prefix="/api/chatbot")
    app.register_blueprint(reports_bp, url_prefix="/api/reports")

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def catch_all(path):
        # Serve static asset files if they exist, otherwise fallback to React Router index.html
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return app.send_static_file(path)
        return app.send_static_file("index.html")

    # Error Handlers
    @app.errorhandler(429)
    def ratelimit_handler(e):
        return jsonify(
            {
                "error": "Too Many Requests",
                "message": "Rate limit exceeded. Please try again later.",
            }
        ), 429

    # Secure HTTP response headers
    @app.after_request
    def add_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

    # Create tables & seed challenges
    with app.app_context():
        db.create_all()
        seed_challenges()

    return app


def seed_challenges():
    # Helper to seed some default challenges if they do not exist
    if Challenge.query.first() is None:
        default_challenges = [
            Challenge(
                title="No Plastic Week",
                description="Refuse single-use plastic cups, containers, and bags for a week.",
                target_value=7.0,  # 7 days
                challenge_type="waste",
                start_date=date(2026, 6, 1),
                end_date=date(2026, 12, 31),
                xp_reward=100,
                points_reward=25,
            ),
            Challenge(
                title="Public Transport commute",
                description="Use train, bus, or subway for your commute at least 3 times this month.",
                target_value=3.0,
                challenge_type="transport",
                start_date=date(2026, 6, 1),
                end_date=date(2026, 12, 31),
                xp_reward=150,
                points_reward=35,
            ),
            Challenge(
                title="Meat-Free Week",
                description="Adopt a vegetarian or vegan diet for 7 days consecutive.",
                target_value=7.0,
                challenge_type="food",
                start_date=date(2026, 6, 1),
                end_date=date(2026, 12, 31),
                xp_reward=200,
                points_reward=50,
            ),
            Challenge(
                title="Energy Saver Extreme",
                description="Keep AC off and use natural ventilation for 5 days.",
                target_value=5.0,
                challenge_type="home",
                start_date=date(2026, 6, 1),
                end_date=date(2026, 12, 31),
                xp_reward=120,
                points_reward=30,
            ),
        ]
        db.session.bulk_save_objects(default_challenges)
        db.session.commit()
