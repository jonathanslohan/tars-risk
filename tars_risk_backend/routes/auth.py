from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from src.models.database import db, User

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Verificar se o usuário já existe
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({'error': 'Nome de usuário já existe'}), 400
    
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': 'Email já está em uso'}), 400
    
    # Criar novo usuário
    user = User(
        username=data.get('username'),
        email=data.get('email')
    )
    user.set_password(data.get('password'))
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'Usuário registrado com sucesso'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    user = User.query.filter_by(username=data.get('username')).first()
    
    if user and user.check_password(data.get('password')):
        login_user(user)
        return jsonify({
            'message': 'Login realizado com sucesso',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        })
    
    return jsonify({'error': 'Credenciais inválidas'}), 401

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logout realizado com sucesso'})

@auth_bp.route('/user', methods=['GET'])
@login_required
def get_user():
    return jsonify({
        'id': current_user.id,
        'username': current_user.username,
        'email': current_user.email
    })

