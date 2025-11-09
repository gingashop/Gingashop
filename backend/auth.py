import random
from flask import Blueprint, request, jsonify
from database import db, User

auth_bp = Blueprint('auth', __name__)

# Simulação de códigos (em produção usar Redis)
verification_codes = {}

@auth_bp.route('/send-code', methods=['POST'])
def send_verification_code():
    data = request.get_json()
    phone = data.get('phone')
    
    if not phone:
        return jsonify({'error': 'Número de telefone obrigatório'}), 400
    
    # Gerar código de 4 dígitos
    code = str(random.randint(1000, 9999))
    verification_codes[phone] = code
    
    # EM PRODUÇÃO: Integrar com API de SMS/WhatsApp real
    print(f"CÓDIGO VERIFICAÇÃO para {phone}: {code}")
    
    return jsonify({'message': 'Código enviado', 'code': code})  # Remover 'code' em produção

@auth_bp.route('/verify-code', methods=['POST'])
def verify_code():
    data = request.get_json()
    phone = data.get('phone')
    code = data.get('code')
    
    if verification_codes.get(phone) == code:
        # Criar ou buscar usuário
        user = User.query.filter_by(phone=phone).first()
        if not user:
            user = User(phone=phone)
            db.session.add(user)
            db.session.commit()
        
        del verification_codes[phone]
        return jsonify({'success': True, 'user_id': user.id})
    
    return jsonify({'error': 'Código inválido'}), 400