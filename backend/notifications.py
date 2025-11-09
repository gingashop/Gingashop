from flask import Blueprint, request, jsonify
import requests
import json

notifications_bp = Blueprint('notifications', __name__)

class WhatsAppNotifier:
    def __init__(self):
        self.api_url = "https://graph.facebook.com/v17.0"
        self.token = "SEU_TOKEN_AQUI"  # Configurar em produção
    
    def send_order_confirmation(self, phone, order_data):
        """Envia confirmação de pedido via WhatsApp"""
        message = f"""
🛍️ *GingaShop - Confirmação de Pedido*

✅ Pedido: {order_data['order_code']}
💰 Total: {order_data['total']} AOA
📦 Itens: {len(order_data['items'])} produtos
📍 Entrega: {order_data['address']}

Obrigado pela sua compra! 
Entraremos em contacto brevemente.
        """
        
        return self._send_message(phone, message)
    
    def _send_message(self, phone, message):
        """Envia mensagem via WhatsApp API"""
        # Implementação real da API do WhatsApp
        # Por enquanto, simulação
        print(f"WHATSAPP para {phone}: {message}")
        return True

@notifications_bp.route('/notify/order-confirmation', methods=['POST'])
def send_order_confirmation():
    data = request.get_json()
    
    notifier = WhatsAppNotifier()
    result = notifier.send_order_confirmation(
        phone=data['phone'],
        order_data=data['order_data']
    )
    
    return jsonify({'success': result})