import pytest
import os
import sys
import tempfile

# Adicionar o diretório raiz ao path para importar os módulos
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import create_app
from models.database import db, User, Risk

@pytest.fixture
def app():
    """Cria e configura uma instância de aplicativo Flask para testes"""
    # Criar um arquivo de banco de dados temporário
    db_fd, db_path = tempfile.mkstemp()
    
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['WTF_CSRF_ENABLED'] = False
    
    # Criar o contexto da aplicação
    with app.app_context():
        db.create_all()
        
        # Criar um usuário de teste
        test_user = User(username='testuser', email='test@example.com')
        test_user.set_password('password123')
        db.session.add(test_user)
        db.session.commit()
        
        # Criar alguns riscos de teste
        test_risk1 = Risk(
            title='Risco de Teste 1',
            description='Descrição do risco de teste 1',
            impact=3,
            probability=2,
            status='Identificado',
            user_id=1
        )
        
        test_risk2 = Risk(
            title='Risco de Teste 2',
            description='Descrição do risco de teste 2',
            impact=1,
            probability=3,
            status='Em análise',
            user_id=1
        )
        
        db.session.add(test_risk1)
        db.session.add(test_risk2)
        db.session.commit()
    
    yield app
    
    # Limpar após os testes
    os.close(db_fd)
    os.unlink(db_path)

@pytest.fixture
def client(app):
    """Um cliente de teste para o aplicativo"""
    return app.test_client()

@pytest.fixture
def runner(app):
    """Um runner de linha de comando para o aplicativo"""
    return app.test_cli_runner()

