#!/bin/bash
echo "🔄 Organizando GingaShop..."

cd ~/gingashop

# Criar diretórios se não existirem
mkdir -p backend frontend

# Mover arquivos do backend
find . -name "*.py" -path "*/backend/*" -exec mv {} backend/ \; 2>/dev/null || true

# Mover arquivos do frontend  
find . -name "*.html" -exec mv {} frontend/ \; 2>/dev/null || true
find . -name "*.js" -exec mv {} frontend/ \; 2>/dev/null || true
find . -name "*.css" -exec mv {} frontend/ \; 2>/dev/null || true

# Mover scripts para raiz
find . -maxdepth 1 -name "*.py" -exec mv {} . \; 2>/dev/null || true
find . -maxdepth 1 -name "*.sh" -exec mv {} . \; 2>/dev/null || true
find . -maxdepth 1 -name "*.md" -exec mv {} . \; 2>/dev/null || true

# Remover diretórios vazios
find . -type d -empty -delete 2>/dev/null || true

echo "✅ Estrutura organizada!"
echo "📁 Conteúdo final:"
ls -la
ls -la backend/
ls -la frontend/
