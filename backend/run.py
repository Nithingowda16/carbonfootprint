import os
from dotenv import load_dotenv
from app import create_app

# Load environment files
load_dotenv()

app = create_app()

if __name__ == '__main__':
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'true').lower() == 'true'
    
    print(f"Starting EcoTrack AI Flask Server on {host}:{port} (debug={debug})...")
    app.run(host=host, port=port, debug=debug)
