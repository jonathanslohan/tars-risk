from flask import Flask, render_template, jsonify
from flask_cors import CORS
from flask_login import LoginManager
import os

from src.models.database import db, User
from src.routes.auth import auth_bp
from src.routes.risks import risks_bp

def create_app():
    app = Flask(__name__, static_folder='static')
    CORS(app)
    
    # Configuração do banco de dados
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://tars_risk:tars_risk_password@localhost/tars_risk_db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'tars-risk-secret-key')
    
    # Inicialização do banco de dados
    db.init_app(app)
    
    # Configuração do sistema de login
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    # Registro dos blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(risks_bp)
    
    # Rota principal
    @app.route('/')
    def index():
        return render_template('index.html')
    
    # Rota para verificar o status da API
    @app.route('/api/status')
    def status():
        return jsonify({'status': 'online', 'message': 'TARS-RISK API está funcionando!'})
    
    # Criação das tabelas do banco de dados
    with app.app_context():
        db.create_all()
        
        # Criar um usuário admin se não existir
        if not User.query.filter_by(username='admin').first():
            admin = User(username='admin', email='admin@tars-risk.com')
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)

