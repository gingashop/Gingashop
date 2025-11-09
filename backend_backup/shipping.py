from flask import Blueprint, request, jsonify
from database import db

shipping_bp = Blueprint('shipping', __name__)

class ShippingCalculator:
    @staticmethod
    def calculate_shipping(province, weight=1):
        """Calcula custo de entrega por província"""
        shipping_rates = {
            'Luanda': 1500,
            'Benguela': 2500,
            'Huambo': 3000,
            'Cabinda': 4000,
            'Huíla': 3500,
            # Adicionar outras províncias
        }
        
        return shipping_rates.get(province, 2000)

@shipping_bp.route('/shipping/calculate', methods=['POST'])
def calculate_shipping():
    data = request.get_json()
    
    cost = ShippingCalculator.calculate_shipping(
        province=data['province'],
        weight=data.get('weight', 1)
    )
    
    return jsonify({'cost': cost, 'currency': 'AOA'})

@shipping_bp.route('/provinces', methods=['GET'])
def get_provinces():
    """Lista de províncias de Angola"""
    provinces = [
        'Luanda', 'Benguela', 'Huambo', 'Cabinda', 'Huíla',
        'Malanje', 'Uíge', 'Zaire', 'Cunene', 'Namibe',
        'Bié', 'Lunda Norte', 'Lunda Sul', 'Moxico',
        'Cuando Cubango', 'Cuanza Norte', 'Cuanza Sul'
    ]
    
    return jsonify(provinces)