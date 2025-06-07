from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.username}>'

class Risk(db.Model):
    __tablename__ = 'risks'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    impact = db.Column(db.Integer, nullable=False)  # 1 (Baixo), 2 (Médio), 3 (Alto)
    probability = db.Column(db.Integer, nullable=False)  # 1 (Baixo), 2 (Médio), 3 (Alto)
    status = db.Column(db.String(50), default='Identificado')  # Identificado, Em análise, Mitigado, etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    owner = db.Column(db.String(100), nullable=True)
    due_date = db.Column(db.Date, nullable=True)
    mitigation_plan = db.Column(db.Text, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    user = db.relationship('User', backref=db.backref('risks', lazy=True))
    
    def __repr__(self):
        return f'<Risk {self.title}>'

