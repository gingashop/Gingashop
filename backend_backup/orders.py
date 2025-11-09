import random
import string
from flask import Blueprint, request, jsonify
from database import db, Order, OrderItem, Product

orders_bp = Blueprint('orders', __name__)

def generate_order_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

@orders_bp.route('/orders', methods=['POST'])
def create_order():
    data = request.get_json()
    
    # Validar stock
    for item in data['items']:
        product = Product.query.get(item['product_id'])
        if product.stock < item['quantity']:
            return jsonify({'error': f'Stock insuficiente para {product.name}'}), 400
    
    # Criar pedido
    order = Order(
        order_code=generate_order_code(),
        user_id=data.get('user_id'),
        phone=data['phone'],
        address=data['address'],
        total=0
    )
    
    db.session.add(order)
    
    # Adicionar items
    total = 0
    for item_data in data['items']:
        product = Product.query.get(item_data['product_id'])
        
        order_item = OrderItem(
            order=order,
            product_id=product.id,
            quantity=item_data['quantity'],
            price=product.price
        )
        
        # Atualizar stock
        product.stock -= item_data['quantity']
        
        total += product.price * item_data['quantity']
    
    order.total = total
    db.session.commit()
    
    # EM PRODUÇÃO: Enviar notificação WhatsApp
    print(f"PEDIDO CRIADO: {order.order_code} - Total: {total} AOA")
    
    return jsonify({
        'order_code': order.order_code,
        'total': total,
        'id': order.id
    })

@orders_bp.route('/orders', methods=['GET'])
def get_orders():
    orders = Order.query.order_by(Order.created_at.desc()).all()
    return jsonify([{
        'id': o.id,
        'order_code': o.order_code,
        'total': o.total,
        'status': o.status,
        'phone': o.phone,
        'address': o.address,
        'created_at': o.created_at.isoformat(),
        'items': [{
            'product': {
                'name': item.product.name,
                'price': item.price
            },
            'quantity': item.quantity
        } for item in o.items]
    } for o in orders])

@orders_bp.route('/orders/<int:order_id>', methods=['PUT'])
def update_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json()
    
    order.status = data.get('status', order.status)
    db.session.commit()
    
    return jsonify({'message': 'Status atualizado'})