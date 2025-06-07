// Configuração da API
const API_URL = 'http://localhost:5000/api';

// Variáveis globais
let risks = [];
let draggedRisk = null;

// Função para obter os riscos da API
async function fetchRisks() {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_URL}/risks/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token inválido, redirecionar para login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
                return;
            }
            throw new Error('Falha ao carregar riscos');
        }
        
        risks = await response.json();
        renderRisksMatrix();
        renderRisksTable();
        
    } catch (error) {
        console.error('Erro ao buscar riscos:', error);
        showNotification('Erro ao carregar riscos. Por favor, tente novamente.', 'error');
    }
}

// Função para renderizar os riscos na matriz
function renderRisksMatrix() {
    // Limpar todas as células da matriz
    const cells = document.querySelectorAll('.risk-matrix-cell');
    cells.forEach(cell => {
        cell.innerHTML = '';
    });
    
    // Adicionar riscos às células correspondentes
    risks.forEach(risk => {
        const cell = document.querySelector(`.risk-matrix-cell[data-impact="${risk.impact}"][data-probability="${risk.probability}"]`);
        if (cell) {
            const riskElement = document.createElement('div');
            riskElement.className = 'risk-item';
            riskElement.dataset.id = risk.id;
            
            // Determinar a classe de status
            let statusClass = 'identified';
            switch (risk.status) {
                case 'Em análise': statusClass = 'analyzing'; break;
                case 'Mitigado': statusClass = 'mitigated'; break;
                case 'Aceito': statusClass = 'accepted'; break;
                case 'Transferido': statusClass = 'transferred'; break;
            }
            
            riskElement.innerHTML = `
                <div class="risk-item-title">${risk.title}</div>
                <div class="risk-item-description">${risk.description ? risk.description.substring(0, 50) + (risk.description.length > 50 ? '...' : '') : ''}</div>
                <div class="risk-item-date">
                    <span class="risk-item-status ${statusClass}">${risk.status}</span>
                    <span>${formatDate(risk.due_date)}</span>
                </div>
            `;
            
            // Adicionar eventos de drag and drop
            riskElement.draggable = true;
            riskElement.addEventListener('dragstart', handleDragStart);
            riskElement.addEventListener('click', () => viewRisk(risk.id));
            
            cell.appendChild(riskElement);
        }
    });
    
    // Adicionar eventos de drop nas células
    cells.forEach(cell => {
        cell.addEventListener('dragover', handleDragOver);
        cell.addEventListener('dragenter', handleDragEnter);
        cell.addEventListener('dragleave', handleDragLeave);
        cell.addEventListener('drop', handleDrop);
    });
}

// Função para renderizar a tabela de riscos
function renderRisksTable() {
    const tableBody = document.getElementById('risks-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    risks.forEach(risk => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${risk.id}</td>
            <td>${risk.title}</td>
            <td>${getImpactLabel(risk.impact)}</td>
            <td>${getProbabilityLabel(risk.probability)}</td>
            <td>${risk.status}</td>
            <td>${risk.owner || '-'}</td>
            <td>${formatDate(risk.due_date)}</td>
            <td>
                <button class="btn btn-sm btn-secondary view-risk" data-id="${risk.id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-primary edit-risk" data-id="${risk.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-risk" data-id="${risk.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Adicionar event listeners para os botões
    document.querySelectorAll('.view-risk').forEach(btn => {
        btn.addEventListener('click', () => viewRisk(btn.dataset.id));
    });
    
    document.querySelectorAll('.edit-risk').forEach(btn => {
        btn.addEventListener('click', () => editRisk(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-risk').forEach(btn => {
        btn.addEventListener('click', () => deleteRisk(btn.dataset.id));
    });
}

// Funções para drag and drop
function handleDragStart(e) {
    draggedRisk = e.target;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
    
    // Adicionar classe para estilo durante o arrasto
    setTimeout(() => {
        draggedRisk.classList.add('dragging');
    }, 0);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('dragover');
}

async function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    if (draggedRisk) {
        const riskId = draggedRisk.dataset.id;
        const impact = parseInt(e.currentTarget.dataset.impact);
        const probability = parseInt(e.currentTarget.dataset.probability);
        
        draggedRisk.classList.remove('dragging');
        
        // Atualizar o risco na API
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${API_URL}/risks/${riskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    impact,
                    probability
                })
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    // Token inválido, redirecionar para login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = 'login.html';
                    return;
                }
                throw new Error('Falha ao atualizar risco');
            }
            
            // Atualizar o risco localmente
            const risk = risks.find(r => r.id == riskId);
            if (risk) {
                risk.impact = impact;
                risk.probability = probability;
            }
            
            // Renderizar novamente
            renderRisksMatrix();
            renderRisksTable();
            
            showNotification('Risco atualizado com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao atualizar risco:', error);
            showNotification('Erro ao atualizar risco. Por favor, tente novamente.', 'error');
        }
    }
    
    draggedRisk = null;
    return false;
}

// Função para criar um novo risco
async function createRisk(riskData) {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_URL}/risks/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(riskData)
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token inválido, redirecionar para login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
                return;
            }
            throw new Error('Falha ao criar risco');
        }
        
        const data = await response.json();
        
        // Atualizar a lista de riscos
        fetchRisks();
        
        closeModal('risk-modal');
        showNotification('Risco criado com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao criar risco:', error);
        showAlert('risk-alert', 'Erro ao criar risco. Por favor, tente novamente.');
    }
}

// Função para atualizar um risco existente
async function updateRisk(riskId, riskData) {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_URL}/risks/${riskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(riskData)
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token inválido, redirecionar para login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
                return;
            }
            throw new Error('Falha ao atualizar risco');
        }
        
        // Atualizar a lista de riscos
        fetchRisks();
        
        closeModal('risk-modal');
        showNotification('Risco atualizado com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao atualizar risco:', error);
        showAlert('risk-alert', 'Erro ao atualizar risco. Por favor, tente novamente.');
    }
}

// Função para excluir um risco
async function deleteRisk(riskId) {
    if (!confirm('Tem certeza que deseja excluir este risco?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_URL}/risks/${riskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token inválido, redirecionar para login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
                return;
            }
            throw new Error('Falha ao excluir risco');
        }
        
        // Atualizar a lista de riscos
        fetchRisks();
        
        showNotification('Risco excluído com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao excluir risco:', error);
        showNotification('Erro ao excluir risco. Por favor, tente novamente.', 'error');
    }
}

// Função para visualizar um risco
function viewRisk(riskId) {
    const risk = risks.find(r => r.id == riskId);
    if (!risk) return;
    
    // Preencher o modal de visualização
    document.getElementById('view-risk-name').textContent = risk.title;
    document.getElementById('view-risk-description').textContent = risk.description || '-';
    document.getElementById('view-risk-impact').textContent = getImpactLabel(risk.impact);
    document.getElementById('view-risk-probability').textContent = getProbabilityLabel(risk.probability);
    document.getElementById('view-risk-status').textContent = risk.status;
    document.getElementById('view-risk-owner').textContent = risk.owner || '-';
    document.getElementById('view-risk-due-date').textContent = formatDate(risk.due_date);
    document.getElementById('view-risk-created').textContent = formatDate(risk.created_at);
    document.getElementById('view-risk-mitigation').textContent = risk.mitigation_plan || '-';
    
    // Configurar botão de edição
    const editFromViewBtn = document.getElementById('edit-from-view-btn');
    if (editFromViewBtn) {
        editFromViewBtn.onclick = () => {
            closeModal('view-risk-modal');
            editRisk(riskId);
        };
    }
    
    // Configurar botão de fechar
    const closeViewBtn = document.getElementById('close-view-btn');
    if (closeViewBtn) {
        closeViewBtn.onclick = () => {
            closeModal('view-risk-modal');
        };
    }
    
    // Abrir o modal
    openModal('view-risk-modal');
}

// Função para editar um risco
function editRisk(riskId) {
    const risk = risks.find(r => r.id == riskId);
    if (!risk) return;
    
    // Preencher o formulário com os dados do risco
    document.getElementById('risk-modal-title').textContent = 'Editar Risco';
    document.getElementById('risk-id').value = risk.id;
    document.getElementById('risk-title').value = risk.title;
    document.getElementById('risk-description').value = risk.description || '';
    document.getElementById('risk-impact').value = risk.impact;
    document.getElementById('risk-probability').value = risk.probability;
    document.getElementById('risk-status').value = risk.status;
    document.getElementById('risk-owner').value = risk.owner || '';
    document.getElementById('risk-due-date').value = risk.due_date ? risk.due_date.split('T')[0] : '';
    document.getElementById('risk-mitigation').value = risk.mitigation_plan || '';
    
    // Abrir o modal
    openModal('risk-modal');
}

// Função para mostrar alertas
function showAlert(elementId, message, type = 'danger') {
    const alertElement = document.getElementById(elementId);
    if (alertElement) {
        alertElement.textContent = message;
        alertElement.className = `alert alert-${type}`;
        alertElement.style.display = 'block';
        
        // Esconder o alerta após 5 segundos
        setTimeout(() => {
            alertElement.style.display = 'none';
        }, 5000);
    }
}

// Função para mostrar notificações
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    const notificationContent = notification.querySelector('.notification-content');
    
    // Definir a mensagem
    notificationMessage.textContent = message;
    
    // Definir o tipo
    notificationContent.className = 'notification-content';
    notificationContent.classList.add(type);
    
    // Mostrar a notificação
    notification.style.display = 'block';
    
    // Esconder a notificação após 5 segundos
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// Função para abrir modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Função para fechar modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Função para formatar data
function formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Função para obter label do impacto
function getImpactLabel(impact) {
    switch (parseInt(impact)) {
        case 1: return 'Baixo';
        case 2: return 'Médio';
        case 3: return 'Alto';
        default: return '-';
    }
}

// Função para obter label da probabilidade
function getProbabilityLabel(probability) {
    switch (parseInt(probability)) {
        case 1: return 'Baixa';
        case 2: return 'Média';
        case 3: return 'Alta';
        default: return '-';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Carregar riscos
    fetchRisks();
    
    // Botão para adicionar novo risco
    const addRiskBtn = document.getElementById('add-risk-btn');
    if (addRiskBtn) {
        addRiskBtn.addEventListener('click', () => {
            // Limpar o formulário
            document.getElementById('risk-modal-title').textContent = 'Adicionar Novo Risco';
            document.getElementById('risk-form').reset();
            document.getElementById('risk-id').value = '';
            
            // Abrir o modal
            openModal('risk-modal');
        });
    }
    
    // Formulário de risco
    const riskForm = document.getElementById('risk-form');
    if (riskForm) {
        riskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const riskId = document.getElementById('risk-id').value;
            
            const riskData = {
                title: document.getElementById('risk-title').value,
                description: document.getElementById('risk-description').value,
                impact: parseInt(document.getElementById('risk-impact').value),
                probability: parseInt(document.getElementById('risk-probability').value),
                status: document.getElementById('risk-status').value,
                owner: document.getElementById('risk-owner').value,
                due_date: document.getElementById('risk-due-date').value,
                mitigation_plan: document.getElementById('risk-mitigation').value
            };
            
            if (riskId) {
                // Atualizar risco existente
                updateRisk(riskId, riskData);
            } else {
                // Criar novo risco
                createRisk(riskData);
            }
        });
    }
    
    // Botão para cancelar formulário
    const cancelRiskBtn = document.getElementById('cancel-risk-btn');
    if (cancelRiskBtn) {
        cancelRiskBtn.addEventListener('click', () => {
            closeModal('risk-modal');
        });
    }
    
    // Campo de busca
    const riskSearch = document.getElementById('risk-search');
    if (riskSearch) {
        riskSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            
            // Filtrar riscos na tabela
            const rows = document.querySelectorAll('#risks-table-body tr');
            rows.forEach(row => {
                const title = row.cells[1].textContent.toLowerCase();
                if (title.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
    
    // Botão de fechar notificação
    const notificationClose = document.querySelector('.notification-close');
    if (notificationClose) {
        notificationClose.addEventListener('click', () => {
            document.getElementById('notification').style.display = 'none';
        });
    }
    
    // Close Buttons para modais
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
});

