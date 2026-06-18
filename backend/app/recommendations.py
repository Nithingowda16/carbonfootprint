from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.models import CarbonRecord

recommendations_bp = Blueprint("recommendations", __name__)

# Predefined recommendations database
RECOMMENDATIONS_POOL = {
    "transport": [
        {
            "key": "bus_commute",
            "title": "Commute by Bus twice a week",
            "description": "Swap your car commute for a bus ride twice a week.",
            "co2_saving": 8.5,  # kg per week
            "difficulty": "medium",
            "cost_saving": 12.0,  # $ saved on fuel/parking
            "impact_score": 8,
            "annual_saving": 442.0,  # kg per year
            "category": "transport",
        },
        {
            "key": "carpool_weekly",
            "title": "Carpool to work with coworkers",
            "description": "Share the ride to divide fuel costs and tailpipe emissions.",
            "co2_saving": 12.0,
            "difficulty": "easy",
            "cost_saving": 18.0,
            "impact_score": 7,
            "annual_saving": 624.0,
            "category": "transport",
        },
        {
            "key": "short_walks",
            "title": "Walk for distances under 2 km",
            "description": "Replace short car trips with a walk or bicycle ride.",
            "co2_saving": 4.2,
            "difficulty": "easy",
            "cost_saving": 5.0,
            "impact_score": 9,
            "annual_saving": 218.4,
            "category": "transport",
        },
    ],
    "home": [
        {
            "key": "reduce_ac",
            "title": "Reduce AC usage by 1 hour daily",
            "description": "Turn off the air conditioner one hour earlier and use natural airflow or a fan.",
            "co2_saving": 6.3,
            "difficulty": "easy",
            "cost_saving": 15.0,
            "impact_score": 8,
            "annual_saving": 327.6,
            "category": "home",
        },
        {
            "key": "led_bulbs",
            "title": "Replace 5 traditional bulbs with LEDs",
            "description": "LED bulbs consume up to 80% less energy and last 10 times longer.",
            "co2_saving": 3.5,
            "difficulty": "easy",
            "cost_saving": 8.0,
            "impact_score": 6,
            "annual_saving": 182.0,
            "category": "home",
        },
        {
            "key": "phantom_load",
            "title": "Unplug appliances when not in use",
            "description": "Unplug electronics (TV, chargers, microwave) to stop phantom power draw.",
            "co2_saving": 2.1,
            "difficulty": "easy",
            "cost_saving": 6.0,
            "impact_score": 5,
            "annual_saving": 109.2,
            "category": "home",
        },
    ],
    "food": [
        {
            "key": "meat_free_day",
            "title": "Incorporate a Meat-Free Monday",
            "description": "Swap red meat or poultry for a fully plant-based meal once a week.",
            "co2_saving": 4.7,
            "difficulty": "easy",
            "cost_saving": 10.0,
            "impact_score": 8,
            "annual_saving": 244.4,
            "category": "food",
        },
        {
            "key": "local_produce",
            "title": "Buy seasonal and local farm produce",
            "description": "Purchase food grown in your region to reduce transport emission miles.",
            "co2_saving": 2.8,
            "difficulty": "medium",
            "cost_saving": -2.0,  # might cost slightly more or less
            "impact_score": 6,
            "annual_saving": 145.6,
            "category": "food",
        },
        {
            "key": "reduce_food_waste",
            "title": "Plan weekly meals to avoid food decay",
            "description": "Compost scraps and only purchase exactly what is in your meal plan.",
            "co2_saving": 5.0,
            "difficulty": "medium",
            "cost_saving": 25.0,
            "impact_score": 9,
            "annual_saving": 260.0,
            "category": "food",
        },
    ],
    "waste": [
        {
            "key": "reusable_water_bottle",
            "title": "Switch to a stainless steel water bottle",
            "description": "Stop buying single-use plastic bottles. Carry your own container.",
            "co2_saving": 1.8,
            "difficulty": "easy",
            "cost_saving": 14.0,
            "impact_score": 7,
            "annual_saving": 93.6,
            "category": "waste",
        },
        {
            "key": "compost_scraps",
            "title": "Start backyard or kitchen composting",
            "description": "Compost vegetable peels and garden trimmings rather than throwing them in landfills.",
            "co2_saving": 8.4,
            "difficulty": "medium",
            "cost_saving": 5.0,
            "impact_score": 8,
            "annual_saving": 436.8,
            "category": "waste",
        },
        {
            "key": "reusable_bags",
            "title": "Use canvas bags for all grocery trips",
            "description": "Keep reusable canvas bags in your car or purse for shopping.",
            "co2_saving": 0.8,
            "difficulty": "easy",
            "cost_saving": 2.0,
            "impact_score": 5,
            "annual_saving": 41.6,
            "category": "waste",
        },
    ],
}


@recommendations_bp.route("/", methods=["GET"])
@jwt_required()
def get_recommendations():
    user_id = int(get_jwt_identity())

    # Retrieve user records to determine highest emission category
    records = CarbonRecord.query.filter_by(user_id=user_id).all()

    # Defaults in case they don't have records yet
    highest_category = "home"

    if records:
        total_t = sum(r.transport_emissions for r in records)
        total_h = sum(r.home_emissions for r in records)
        total_f = sum(r.food_emissions for r in records)
        total_w = sum(r.waste_emissions for r in records)

        totals = {
            "transport": total_t,
            "home": total_h,
            "food": total_f,
            "waste": total_w,
        }
        highest_category = max(totals, key=totals.get)

    # Compile recommendations: Prioritize the highest category, but include others for breadth
    recommendations = []

    # Add all recommendations from the highest category
    recommendations.extend(RECOMMENDATIONS_POOL[highest_category])

    # Fill in the rest with one sample from other categories
    for cat, items in RECOMMENDATIONS_POOL.items():
        if cat != highest_category:
            recommendations.append(items[0])

    # Mock some personalized AI textual insights
    insights = []
    if highest_category == "transport":
        insights.append(
            "Your transport emissions are elevated. Swapping driving for walking shorter errands can reduce carbon footprint by 15%."
        )
    elif highest_category == "home":
        insights.append(
            "AC and heating make up the bulk of your home energy load. Using natural ventilation is highly effective."
        )
    elif highest_category == "food":
        insights.append(
            "A meat-heavy diet contributes significantly to your footprint. Consider incorporating meat-free days."
        )
    else:
        insights.append(
            "Landfill waste creates methane. Separating organic scraps for composting decreases waste footprint by 40%."
        )

    insights.append(
        f"Based on your profile, implementing all suggestions could save up to {sum(r['annual_saving'] for r in recommendations):.1f} kg CO2 annually!"
    )

    return jsonify(
        {
            "highest_category": highest_category,
            "recommendations": recommendations,
            "ai_insights": insights,
        }
    ), 200
