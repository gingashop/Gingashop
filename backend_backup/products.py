from flask import Blueprint, request, jsonify
from database import db, Product

products_bp = Blueprint('products', __name__)

@products_bp.route('/products', methods=['GET'])
def get_products():
    products = Product.query.filter_by(is_active=True).all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'price': p.price,
        'stock': p.stock,
        'image': p.image,
        'category': p.category
    } for p in products])

@products_bp.route('/products', methods=['POST'])
def create_product():
    data = request.get_json()
    
    product = Product(
        name=data['name'],
        price=float(data['price']),
        stock=int(data['stock']),
        image=data.get('image', ''),
        category=data.get('category', 'Geral')
    )
    
    db.session.add(product)
    db.session.commit()
    
    return jsonify({'message': 'Produto criado', 'id': product.id})

@products_bp.route('/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.get_json()
    
    product.name = data.get('name', product.name)
    product.price = float(data.get('price', product.price))
    product.stock = int(data.get('stock', product.stock))
    product.image = data.get('image', product.image)
    product.category = data.get('category', product.category)
    
    db.session.commit()
    return jsonify({'message': 'Produto atualizado'})

@products_bp.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    product.is_active = False
    db.session.commit()
    return jsonify({'message': 'Produto removido'})