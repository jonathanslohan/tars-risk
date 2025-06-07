import pytest
import json
from flask import session

def test_register(client):
    """Teste para o registro de usuário"""
    response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpassword123'
        }),
        content_type='application/json'
    )
    
    assert response.status_code == 201
    assert 'Usuário registrado com sucesso' in json.loads(response.data)['message']

def test_register_duplicate_username(client):
    """Teste para o registro com nome de usuário duplicado"""
    # Primeiro registro
    client.post(
        '/api/auth/register',
        data=json.dumps({
            'username': 'duplicateuser',
            'email': 'duplicate1@example.com',
            'password': 'password123'
        }),
        content_type='application/json'
    )
    
    # Segundo registro com o mesmo nome de usuário
    response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'username': 'duplicateuser',
            'email': 'duplicate2@example.com',
            'password': 'password123'
        }),
        content_type='application/json'
    )
    
    assert response.status_code == 400
    assert 'Nome de usuário já existe' in json.loads(response.data)['error']

def test_login(client):
    """Teste para o login de usuário"""
    response = client.post(
        '/api/auth/login',
        data=json.dumps({
            'username': 'testuser',
            'password': 'password123'
        }),
        content_type='application/json'
    )
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'Login realizado com sucesso' in data['message']
    assert 'access_token' in data
    assert data['user']['username'] == 'testuser'

def test_login_invalid_credentials(client):
    """Teste para o login com credenciais inválidas"""
    response = client.post(
        '/api/auth/login',
        data=json.dumps({
            'username': 'testuser',
            'password': 'wrongpassword'
        }),
        content_type='application/json'
    )
    
    assert response.status_code == 401
    assert 'Credenciais inválidas' in json.loads(response.data)['error']

