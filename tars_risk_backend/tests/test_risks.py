import pytest
import json
from flask_jwt_extended import create_access_token

def test_get_risks(client, app):
    """Teste para obter todos os riscos"""
    with app.app_context():
        # Criar um token de acesso para o usuário de teste
        access_token = create_access_token(identity=1)
    
    response = client.get(
        '/api/risks/',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) == 2
    assert data[0]['title'] == 'Risco de Teste 1'
    assert data[1]['title'] == 'Risco de Teste 2'

def test_get_risk(client, app):
    """Teste para obter um risco específico"""
    with app.app_context():
        # Criar um token de acesso para o usuário de teste
        access_token = create_access_token(identity=1)
    
    response = client.get(
        '/api/risks/1',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['title'] == 'Risco de Teste 1'
    assert data['impact'] == 3
    assert data['probability'] == 2

def test_create_risk(client, app):
    """Teste para criar um novo risco"""
    with app.app_context():
        # Criar um token de acesso para o usuário de teste
        access_token = create_access_token(identity=1)
    
    response = client.post(
        '/api/risks/',
        headers={'Authorization': f'Bearer {access_token}'},
        data=json.dumps({
            'title': 'Novo Risco',
            'description': 'Descrição do novo risco',
            'impact': 2,
            'probability': 1,
            'status': 'Identificado',
            'owner': 'Responsável Teste'
        }),
        content_type='application/json'
    )
    
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['title'] == 'Novo Risco'
    assert 'id' in data
    
    # Verificar se o risco foi realmente criado
    with app.app_context():
        # Criar um token de acesso para o usuário de teste
        access_token = create_access_token(identity=1)
    
    response = client.get(
        '/api/risks/',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) == 3
    assert any(risk['title'] == 'Novo Risco' for risk in data)

def test_update_risk(client, app):
    """Teste para atualizar um risco existente"""
    with app.app_context():
        # Criar um token de acesso para o usuário de teste
        access_token = create_access_token(identity=1)
    
    response = client.put(
        '/api/risks/1',
        headers={'Authorization': f'Bearer {access_token}'},
        data=json.dumps({
            'title': 'Risco Atualizado',
            'impact': 1,
            'probability': 3
        }),
        content_type='application/json'
    )
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'Risco atualizado com sucesso' in data['message']
    
    # Verificar se o risco foi realmente atualizado
    response = client.get(
        '/api/risks/1',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['title'] == 'Risco Atualizado'
    assert data['impact'] == 1
    assert data['probability'] == 3

def test_delete_risk(client, app):
    """Teste para excluir um risco"""
    with app.app_context():
        # Criar um token de acesso para o usuário de teste
        access_token = create_access_token(identity=1)
    
    response = client.delete(
        '/api/risks/2',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'Risco excluído com sucesso' in data['message']
    
    # Verificar se o risco foi realmente excluído
    response = client.get(
        '/api/risks/',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) == 1
    assert data[0]['id'] == 1

