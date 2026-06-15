from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, ChatHistory

chatbot_bp = Blueprint('chatbot', __name__)

# Heuristic responses based on common keywords
BOT_RESPONSES = [
    {
        'keywords': ['hello', 'hi', 'hey', 'greetings'],
        'response': "Hello! I am your AI Eco Assistant. Ask me anything about carbon footprints, green habits, energy conservation, or how to reach your goals!"
    },
    {
        'keywords': ['carbon footprint', 'what is carbon', 'co2'],
        'response': "A **carbon footprint** is the total greenhouse gas emissions (specifically CO2 and methane) caused directly and indirectly by an individual, event, or product. The global average is around 4 tons of CO2 per year, but to avoid global warming, we need to reduce that to under 2 tons per person."
    },
    {
        'keywords': ['transport', 'car', 'flight', 'commute', 'driving'],
        'response': "Transportation is one of the largest sources of individual emissions. You can reduce this by:\n- **Walking or biking** for distances under 2 kilometers.\n- **Taking public transport** (bus, subway, trains) which emits 60-80% less CO2 per passenger mile.\n- **Carpooling** or using ride-share services to share emission loads."
    },
    {
        'keywords': ['energy', 'electricity', 'ac', 'bills', 'home', 'appliances'],
        'response': "Home energy accounts for a massive chunk of residential emissions. Here are simple tips to optimize:\n1. **Reduce AC hours**: Turning off the AC just 1 hour daily saves up to 120 kg of CO2 annually.\n2. **Switch to LED bulbs**: They use 80% less energy than incandescent lightbulbs.\n3. **Unplug Phantom Loads**: Chargers, TVs, and appliances draw electricity even when turned off if plugged in."
    },
    {
        'keywords': ['food', 'meat', 'vegan', 'diet', 'vegetarian'],
        'response': "Food production makes up nearly 26% of global greenhouse emissions. Animal-based foods (especially beef and dairy) have a much higher footprint than plant-based foods. Swapping to a **vegetarian** or **vegan** diet, or even introducing 'Meat-free days' can cut your food-related emissions by up to 50%!"
    },
    {
        'keywords': ['waste', 'recycling', 'plastic', 'compost', 'landfill'],
        'response': "Methane is released when organic waste rots in landfills. You can make a difference by:\n- **Composting**: Kitchen and yard scraps turn into nutrient-rich soil rather than landfill methane.\n- **Refusing single-use plastic**: Plastic is oil-based; switching to reusable cups and canvas bags makes a huge difference.\n- **Recycling paper, metal, and glass** correctly."
    },
    {
        'keywords': ['tree', 'offset', 'trees'],
        'response': "Trees are nature's carbon absorbers! On average, a mature tree absorbs roughly **22 kg of CO2 per year**. So, saving 50 kg of CO2 is equivalent to planting and growing 2-3 trees for a full year!"
    },
    {
        'keywords': ['goal', 'streak', 'points', 'badges', 'gamification'],
        'response': "EcoTrack AI rewards your habits! You earn **XP** and **Green Points** for logging daily emissions and completing green actions. Complete challenges to earn specialized badges (e.g. Eco Warrior) and level up on the leaderboard!"
    }
]

DEFAULT_RESPONSE = (
    "That is a great question! Reducing emissions involves small, daily habits like walking short distances, "
    "reducing AC runtime, unplugging inactive appliances, and minimizing meat consumption. "
    "To help you specifically, could you ask me about 'transportation energy savings', 'composting tips', or 'how food affects carbon footprints'?"
)

def generate_bot_reply(message):
    message_lower = message.lower()
    for item in BOT_RESPONSES:
        for kw in item['keywords']:
            if kw in message_lower:
                return item['response']
    return DEFAULT_RESPONSE

@chatbot_bp.route('/', methods=['POST'])
@jwt_required()
def post_message():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    user_message = data.get('message', '').strip()
    
    if not user_message:
        return jsonify({'error': 'Message cannot be empty'}), 400
        
    # Save user message to database
    user_chat = ChatHistory(user_id=user_id, message=user_message, sender='user')
    db.session.add(user_chat)
    
    # Generate reply
    bot_reply = generate_bot_reply(user_message)
    
    # Save bot reply to database
    bot_chat = ChatHistory(user_id=user_id, message=bot_reply, sender='bot')
    db.session.add(bot_chat)
    
    db.session.commit()
    
    return jsonify({
        'user_message': user_chat.to_dict(),
        'bot_message': bot_chat.to_dict()
    }), 200

@chatbot_bp.route('/history', methods=['GET'])
@jwt_required()
def get_chat_history():
    user_id = int(get_jwt_identity())
    chats = ChatHistory.query.filter_by(user_id=user_id).order_by(ChatHistory.timestamp.asc()).all()
    return jsonify([c.to_dict() for c in chats]), 200
