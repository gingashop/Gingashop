class LojaApp {
    constructor() {
        this.apiBase = '/api';
        this.cart = [];
        this.user = null;
        this.products = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadProducts();
        this.updateCartUI();
        this.checkAuthStatus();
    }

    bindEvents() {
        // Autenticação
        document.getElementById('phoneForm').addEventListener('submit', (e) => this.sendCode(e));
        document.getElementById('codeForm').addEventListener('submit', (e) => this.verifyCode(e));
        
        // Carrinho
        document.getElementById('cartBtn').addEventListener('click', () => this.toggleCart());
        document.getElementById('closeCartBtn').addEventListener('click', () => this.toggleCart());
        document.getElementById('checkoutBtn').addEventListener('click', () => this.checkout());
        
        // Admin
        document.getElementById('adminBtn').addEventListener('click', () => window.location.href = '/admin.html');
    }

    checkAuthStatus() {
        // Verificar se usuário já está autenticado (armazenado em localStorage)
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            this.user = JSON.parse(savedUser);
            this.showProducts();
        }
    }

    async sendCode(e) {
        e.preventDefault();
        const phone = document.querySelector('#phoneForm input').value;
        
        try {
            const response = await fetch(`${this.apiBase}/send-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            
            const data = await response.json();
            if (response.ok) {
                document.getElementById('phoneForm').classList.add('hidden');
                document.getElementById('codeForm').classList.remove('hidden');
                // Armazenar telefone para uso posterior
                this.currentPhone = phone;
            } else {
                alert('Erro: ' + data.error);
            }
        } catch (error) {
            alert('Erro de conexão. Verifique se o servidor está rodando.');
        }
    }

    async verifyCode(e) {
        e.preventDefault();
        const code = document.querySelector('#codeForm input').value;
        
        try {
            const response = await fetch(`${this.apiBase}/verify-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: this.currentPhone, code })
            });
            
            const data = await response.json();
            if (data.success) {
                this.user = { id: data.user_id, phone: this.currentPhone };
                localStorage.setItem('user', JSON.stringify(this.user));
                this.showProducts();
            } else {
                alert('Código inválido');
            }
        } catch (error) {
            alert('Erro de conexão');
        }
    }

    showProducts() {
        document.getElementById('authSection').classList.add('hidden');
        document.getElementById('productsSection').classList.remove('hidden');
    }

    async loadProducts() {
        try {
            const response = await fetch(`${this.apiBase}/products`);
            this.products = await response.json();
            this.renderProducts(this.products);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            // Mostrar mensagem amigável
            const grid = document.getElementById('productsGrid');
            grid.innerHTML = '<p style="text-align: center; color: #666;">Erro ao carregar produtos. Verifique sua conexão.</p>';
        }
    }

    renderProducts(products) {
        const grid = document.getElementById('productsGrid');
        
        if (products.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: #666;">Nenhum produto disponível no momento.</p>';
            return;
        }
        
        grid.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image || 'https://via.placeholder.com/280x200?text=Produto'}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="product-price">${product.price} AOA</p>
                <p class="product-stock">Stock: ${product.stock} unidades</p>
                <button onclick="app.addToCart(${product.id})" 
                        ${product.stock === 0 ? 'disabled' : ''}>
                    ${product.stock === 0 ? 'Sem Stock' : 'Adicionar ao Carrinho'}
                </button>
            </div>
        `).join('');
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product || product.stock === 0) return;

        const existingItem = this.cart.find(item => item.product_id === productId);
        
        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                existingItem.quantity += 1;
            } else {
                alert('Stock insuficiente!');
                return;
            }
        } else {
            this.cart.push({
                product_id: productId,
                quantity: 1,
                price: product.price,
                name: product.name,
                image: product.image
            });
        }
        
        this.updateCartUI();
        this.saveCart();
    }

    updateCartUI() {
        const totalItems = this.cart.reduce((total, item) => total + item.quantity, 0);
        document.getElementById('cartCount').textContent = totalItems;
        
        const cartItems = document.getElementById('cartItems');
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        document.getElementById('cartTotal').textContent = total.toFixed(2);
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; color: #666;">Carrinho vazio</p>';
        } else {
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div>
                        <strong>${item.name}</strong>
                        <br>
                        <small>${item.price} AOA x ${item.quantity}</small>
                    </div>
                    <div>
                        <button onclick="app.removeFromCart(${item.product_id})" style="background: #dc3545; padding: 0.25rem 0.5rem; font-size: 0.8rem;">Remover</button>
                    </div>
                </div>
            `).join('');
        }
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.product_id !== productId);
        this.updateCartUI();
        this.saveCart();
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }
    }

    toggleCart() {
        const modal = document.getElementById('cartModal');
        modal.classList.toggle('hidden');
    }

    async checkout() {
        if (!this.user) {
            alert('Faça login primeiro!');
            return;
        }

        if (this.cart.length === 0) {
            alert('Carrinho vazio!');
            return;
        }

        const phone = prompt('Número para contacto:', this.user.phone || '');
        const address = prompt('Endereço de entrega:');
        
        if (!phone || !address) {
            alert('Preencha todos os campos!');
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: this.user.id,
                    phone: phone,
                    address: address,
                    items: this.cart.map(item => ({
                        product_id: item.product_id,
                        quantity: item.quantity
                    }))
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                alert(`✅ Pedido criado com sucesso!\n\n📋 Código: ${data.order_code}\n💰 Total: ${data.total.toFixed(2)} AOA\n\n📱 Enviaremos atualizações via WhatsApp`);
                
                // Limpar carrinho
                this.cart = [];
                this.updateCartUI();
                this.saveCart();
                this.toggleCart();
                
                // Recarregar produtos para atualizar stock
                this.loadProducts();
            } else {
                alert('❌ Erro: ' + data.error);
            }
        } catch (error) {
            alert('❌ Erro ao criar pedido. Tente novamente.');
        }
    }
}

// Inicializar app quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LojaApp();
    app.loadCart();
});