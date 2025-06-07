import pytest
from models.database import User, Risk

def test_user_password():
    """Teste para verificar se a senha está sendo hasheada corretamente"""
    user = User(username='testuser', email='test@example.com')
    user.set_password('password123')
    
    # Verificar se a senha foi hasheada
    assert user.password_hash is not None
    assert user.password_hash != 'password123'
    
    # Verificar se a verificação de senha funciona
    assert user.check_password('password123') is True
    assert user.check_password('wrongpassword') is False

def test_user_repr():
    """Teste para verificar a representação string do usuário"""
    user = User(username='testuser', email='test@example.com')
    assert str(user) == '<User testuser>'

def test_risk_repr():
    """Teste para verificar a representação string do risco"""
    risk = Risk(title='Teste de Risco', impact=3, probability=2)
    assert str(risk) == '<Risk Teste de Risco>'

