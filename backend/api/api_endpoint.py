from flask import Flask
from flask_cors import CORS
import os

# Import route blueprints
from routes.database_routes import database_routes
from routes.uyap_routes import uyap_routes

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Register blueprints
app.register_blueprint(database_routes)
app.register_blueprint(uyap_routes)

if __name__ == '__main__':
    # Check if database exists
    DB_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'database', 'files.db')
    if not os.path.exists(DB_PATH):
        print(f"Warning: Database file {DB_PATH} not found!")
    
    print("Starting Database API Server...")
    print(f"Database path: {DB_PATH}")
    app.run(debug=True, port=5001, host='0.0.0.0') 