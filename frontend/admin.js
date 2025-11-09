class AdminApp {
    constructor() {
        this.apiBase = '/api';
        this.products = [];
        this.orders = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadProducts();
        this.loadOrders();
        this.updateStats();
    }

    bindEvents() {
        document.getElementById('productForm').addEventListener('submit', (e) => this.addProduct(e));
    }

    async addProduct(e) {
        e.preventDefault();
        
        const product = {
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            image: document.getElementById('productImage').value || '',
            category: document.getElementById('productCategory').value || 'Geral'
        };

        try {
            const response = await fetch(`${this.apiBase}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });

            const data = await response.json();
            
            if (response.ok) {
                alert('✅ Produto adicionado com sucesso!');
                this.loadProducts();
                this.updateStats();
                e.target.reset();
            } else {
                alert('❌ Erro: ' + data.error);
            }
        } catch (error) {
            alert('❌ Erro de conexão. Verifique se o servidor está rodando.');
        }
    }

    async loadProducts() {
        try {
            const response = await fetch(`${this.apiBase}/products`);
            this.products = await response.json();
            this.renderProducts();
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
        }
    }

    renderProducts() {
        const container = document.getElementById('adminProducts');
        
        if (this.products.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">Nenhum produto cadastrado.</p>';
            return;
        }
        
        container.innerHTML = this.products.map(product => `
            <div class="product-card" style="margin-bottom: 1rem;">
                <img src="${product.image || 'https://via.placeholder.com/280x200?text=Produto'}" alt="${product.name}" style="width: 100px; height: 80px; object-fit: cover;">
                <div style="flex: 1; margin-left: 1rem;">
                    <h4>${product.name}</h4>
                    <p>Preço: ${product.price} AOA | Stock: ${product.stock} | Categoria: ${product.category}</p>
                    <button onclick="admin.editProduct(${product.id})" style="background: #28a745; margin-right: 0.5rem;">Editar</button>
                    <button onclick="admin.deleteProduct(${product.id})" style="background: #dc3545;">Remover</button>
                </div>
                <div id="editForm_${product.id}" class="product-edit-form">
                    <h4>Editar Produto</h4>
                    <input type="text" id="edit_name_${product.id}" value="${product.name}" placeholder="Nome">
                    <input type="number" id="edit_price_${product.id}" value="${product.price}" placeholder="Preço" step="0.01">
                    <input type="number" id="edit_stock_${product.id}" value="${product.stock}" placeholder="Stock">
                    <input type="text" id="edit_category_${product.id}" value="${product.category}" placeholder="Categoria">
                    <button onclick="admin.saveProduct(${product.id})" style="background: #28a745; margin-right: 0.5rem;">Salvar</button>
                    <button onclick="admin.cancelEdit(${product.id})" style="background: #6c757d;">Cancelar</button>
                </div>
            </div>
        `).join('');
    }

    editProduct(productId) {
        const form = document.getElementById(`editForm_${productId}`);
        form.classList.add('active');
    }

    cancelEdit(productId) {
        const form = document.getElementById(`editForm_${productId}`);
        form.classList.remove('active');
    }

    async saveProduct(productId) {
        const productData = {
            name: document.getElementById(`edit_name_${productId}`).value,
            price: parseFloat(document.getElementById(`edit_price_${productId}`).value),
            stock: parseInt(document.getElementById(`edit_stock_${productId}`).value),
            category: document.getElementById(`edit_category_${productId}`).value
        };

        try {
            const response = await fetch(`${this.apiBase}/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                alert('✅ Produto atualizado com sucesso!');
                this.loadProducts();
                this.updateStats();
            } else {
                alert('❌ Erro ao atualizar produto');
            }
        } catch (error) {
            alert('❌ Erro de conexão');
        }
    }

    async deleteProduct(productId) {
        if (!confirm('Tem certeza que deseja remover este produto?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/products/${productId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('✅ Produto removido com sucesso!');
                this.loadProducts();
                this.updateStats();
            } else {
                alert('❌ Erro ao remover produto');
            }
        } catch (error) {
            alert('❌ Erro de conexão');
        }
    }

    async loadOrders() {
        try {
            const response = await fetch(`${this.apiBase}/orders`);
            this.orders = await response.json();
            this.renderOrders();
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
        }
    }

    renderOrders() {
        const container = document.getElementById('ordersList');
        
        if (this.orders.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">Nenhum pedido ainda.</p>';
            return;
        }
        
        container.innerHTML = this.orders.map(order => `
            <div class="order-item">
                <h4>Pedido ${order.order_code}</h4>
                <p><strong>Total:</strong> ${order.total.toFixed(2)} AOA</p>
                <p><strong>Status:</strong> <span class="order-status status-${order.status}">${this.getStatusText(order.status)}</span></p>
                <p><strong>Telefone:</strong> ${order.phone}</p>
                <p><strong>Endereço:</strong> ${order.address}</p>
                <p><strong>Data:</strong> ${new Date(order.created_at).toLocaleString('pt-AO')}</p>
                
                <div style="margin-top: 1rem;">
                    <strong>Itens:</strong>
                    <ul style="margin-left: 1rem;">
                        ${order.items.map(item => `
                            <li>${item.product.name} - ${item.quantity}x ${item.price} AOA</li>
                        `).join('')}
                    </ul>
                </div>
                
                <div style="margin-top: 1rem;">
                    <label for="status_${order.id}">Mudar Status:</label>
                    <select id="status_${order.id}" onchange="admin.updateOrderStatus(${order.id})">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pendente</option>
                        <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmado</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Entregue</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </div>
            </div>
        `).join('');
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'Pendente',
            'confirmed': 'Confirmado',
            'delivered': 'Entregue',
            'cancelled': 'Cancelado'
        };
        return statusMap[status] || status;
    }

    async updateOrderStatus(orderId) {
        const select = document.getElementById(`status_${orderId}`);
        const newStatus = select.value;

        try {
            const response = await fetch(`${this.apiBase}/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                alert('✅ Status atualizado com sucesso!');
                this.updateStats();
            } else {
                alert('❌ Erro ao atualizar status');
                this.loadOrders(); // Recarregar para restaurar valor anterior
            }
        } catch (error) {
            alert('❌ Erro de conexão');
        }
    }

    updateStats() {
        // Calcular estatísticas
        const totalProducts = this.products.length;
        const totalOrders = this.orders.length;
        const totalRevenue = this.orders
            .filter(order => order.status !== 'cancelled')
            .reduce((sum, order) => sum + order.total, 0);
        const pendingOrders = this.orders.filter(order => order.status === 'pending').length;

        // Atualizar UI
        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('totalRevenue').textContent = totalRevenue.toFixed(2);
        document.getElementById('pendingOrders').textContent = pendingOrders;
    }
}

const admin = new AdminApp();