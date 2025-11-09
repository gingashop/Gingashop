import os

class Config:
    # Configurações GingaShop
    SECRET_KEY = os.urandom(24)
    DATABASE_URL = 'sqlite:///gingashop.db'
    WHATSAPP_NUMBER = "+244935520796"  # Número real da GingaShop
    STORE_NAME = "GingaShop - Moda Angolana"
    CURRENCY = "AOA"
    SUPPORT_EMAIL = "gingashop.ao@gmail.com"
    
    # Configurações de produção
    DEBUG = False
    TESTING = False
    
    # Configurações do Flask
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Segurança
    SESSION_COOKIE_SECURE = False  # Mudar para True em produção com HTTPS
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'

class DevelopmentConfig(Config):
    DEBUG = True
    DATABASE_URL = 'sqlite:///gingashop_dev.db'
    SQLALCHEMY_DATABASE_URI = DATABASE_URL

class ProductionConfig(Config):
    DEBUG = False
    # Para produção, usar PostgreSQL
    # DATABASE_URL = 'postgresql://gingashop_user:senha_segura@localhost/gingashop_prod'
    # SQLALCHEMY_DATABASE_URI = DATABASE_URL