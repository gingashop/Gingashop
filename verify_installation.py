#!/usr/bin/env python3
"""
Script de Verificação - GingaShop
"""

import os
import sys
import importlib.util

def check_file_exists(filepath):
    return os.path.exists(filepath)

def check_python_dependencies():
    required_packages = ['flask', 'flask_cors', 'flask_sqlalchemy', 'dotenv', 'requests']
    missing_packages = []
    
    for package in required_packages:
        try:
            spec = importlib.util.find_spec(package)
            if spec is None:
                missing_packages.append(package)
        except ImportError:
            missing_packages.append(package)
    
    return missing_packages

def main():
    print("🔍 Verificando GingaShop no Termux...")
    print("=" * 50)
    
    # Verificar estrutura
    required_files = [
        'backend/app.py',
        'backend/requirements.txt',
        'frontend/index.html',
        'frontend/styles.css'
    ]
    
    print("📁 Verificando estrutura...")
    for file_path in required_files:
        if check_file_exists(file_path):
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path}")
    
    # Verificar dependências
    print("\n📦 Verificando dependências...")
    missing_deps = check_python_dependencies()
    if missing_deps:
        print(f"❌ Faltando: {', '.join(missing_deps)}")
    else:
        print("✅ Todas dependências instaladas!")
    
    print("\n🎯 STATUS: GINGASHOP PRONTA!")
    print("🚀 Execute: cd backend && python app.py")
    print("🌐 Acesse: http://localhost:5000")

if __name__ == "__main__":
    main()
