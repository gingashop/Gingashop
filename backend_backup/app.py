from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from database import db
from config import Config
import os

# Import blueprints
from auth import auth_bp
from products import products_bp
from orders import orders_bp
from payments import payments_bp
from shipping import shipping_bp
from notifications import notifications_bp

app = Flask(__name__)
app.config.from_object(Config)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///gingashop.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)

# Inicializar database
db.init_app(app)

# Registrar blueprints
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(products_bp, url_prefix='/api')
app.register_blueprint(orders_bp, url_prefix='/api')
app.register_blueprint(payments_bp, url_prefix='/api')
app.register_blueprint(shipping_bp, url_prefix='/api')
app.register_blueprint(notifications_bp, url_prefix='/api')

# Servir frontend
@app.route('/')
def serve_frontend():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../frontend', path)

# Health check
@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy', 'store': 'GingaShop'})

# Criar tabelas
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=app.config.get('DEBUG', True))