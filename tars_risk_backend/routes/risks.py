from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from src.models.database import db, Risk
from datetime import datetime

risks_bp = Blueprint('risks', __name__, url_prefix='/api/risks')

@risks_bp.route('/', methods=['GET'])
@login_required
def get_risks():
    risks = Risk.query.filter_by(user_id=current_user.id).all()
    
    result = []
    for risk in risks:
        result.append({
            'id': risk.id,
            'title': risk.title,
            'description': risk.description,
            'impact': risk.impact,
            'probability': risk.probability,
            'status': risk.status,
            'created_at': risk.created_at.isoformat(),
            'updated_at': risk.updated_at.isoformat(),
            'owner': risk.owner,
            'due_date': risk.due_date.isoformat() if risk.due_date else None,
            'mitigation_plan': risk.mitigation_plan
        })
    
    return jsonify(result)

@risks_bp.route('/<int:risk_id>', methods=['GET'])
@login_required
def get_risk(risk_id):
    risk = Risk.query.filter_by(id=risk_id, user_id=current_user.id).first()
    
    if not risk:
        return jsonify({'error': 'Risco não encontrado'}), 404
    
    return jsonify({
        'id': risk.id,
        'title': risk.title,
        'description': risk.description,
        'impact': risk.impact,
        'probability': risk.probability,
        'status': risk.status,
        'created_at': risk.created_at.isoformat(),
        'updated_at': risk.updated_at.isoformat(),
        'owner': risk.owner,
        'due_date': risk.due_date.isoformat() if risk.due_date else None,
        'mitigation_plan': risk.mitigation_plan
    })

@risks_bp.route('/', methods=['POST'])
@login_required
def create_risk():
    data = request.get_json()
    
    due_date = None
    if data.get('due_date'):
        try:
            due_date = datetime.fromisoformat(data.get('due_date')).date()
        except ValueError:
            return jsonify({'error': 'Formato de data inválido'}), 400
    
    risk = Risk(
        title=data.get('title'),
        description=data.get('description'),
        impact=data.get('impact'),
        probability=data.get('probability'),
        status=data.get('status', 'Identificado'),
        owner=data.get('owner'),
        due_date=due_date,
        mitigation_plan=data.get('mitigation_plan'),
        user_id=current_user.id
    )
    
    db.session.add(risk)
    db.session.commit()
    
    return jsonify({
        'id': risk.id,
        'title': risk.title,
        'message': 'Risco criado com sucesso'
    }), 201

@risks_bp.route('/<int:risk_id>', methods=['PUT'])
@login_required
def update_risk(risk_id):
    risk = Risk.query.filter_by(id=risk_id, user_id=current_user.id).first()
    
    if not risk:
        return jsonify({'error': 'Risco não encontrado'}), 404
    
    data = request.get_json()
    
    if 'title' in data:
        risk.title = data['title']
    
    if 'description' in data:
        risk.description = data['description']
    
    if 'impact' in data:
        risk.impact = data['impact']
    
    if 'probability' in data:
        risk.probability = data['probability']
    
    if 'status' in data:
        risk.status = data['status']
    
    if 'owner' in data:
        risk.owner = data['owner']
    
    if 'due_date' in data and data['due_date']:
        try:
            risk.due_date = datetime.fromisoformat(data['due_date']).date()
        except ValueError:
            return jsonify({'error': 'Formato de data inválido'}), 400
    
    if 'mitigation_plan' in data:
        risk.mitigation_plan = data['mitigation_plan']
    
    db.session.commit()
    
    return jsonify({'message': 'Risco atualizado com sucesso'})

@risks_bp.route('/<int:risk_id>', methods=['DELETE'])
@login_required
def delete_risk(risk_id):
    risk = Risk.query.filter_by(id=risk_id, user_id=current_user.id).first()
    
    if not risk:
        return jsonify({'error': 'Risco não encontrado'}), 404
    
    db.session.delete(risk)
    db.session.commit()
    
    return jsonify({'message': 'Risco excluído com sucesso'})

