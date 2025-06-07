// Configuração da API
const API_URL = 'http://localhost:5000/api';

// Variáveis globais
let risks = [];
let currentPage = 1;
let risksPerPage = 10;
let filteredRisks = [];

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
            throw new Error('Falha ao carregar riscos');
        }
        
        risks = await response.json();
        filteredRisks = [...risks];
        
        renderRisksTable();
        renderPagination();
        renderCharts();
        
    } catch (error) {
        console.error('Erro ao buscar riscos:', error);
        showNotification('Erro ao carregar riscos. Por favor, tente novamente.', 'error');
    }
}

// Função para renderizar a tabela de riscos
function renderRisksTable() {
    const tableBody = document.getElementById('risks-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // Calcular índices para paginação
    const startIndex = (currentPage - 1) * risksPerPage;
    const endIndex = startIndex + risksPerPage;
    const paginatedRisks = filteredRisks.slice(startIndex, endIndex);
    
    if (paginatedRisks.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="9" class="text-center">Nenhum risco encontrado</td>';
        tableBody.appendChild(row);
        return;
    }
    
    paginatedRisks.forEach(risk => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${risk.id}</td>
            <td>${risk.title}</td>
            <td>${risk.description ? risk.description.substring(0, 50) + (risk.description.length > 50 ? '...' : '') : '-'}</td>
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

// Função para renderizar a paginação
function renderPagination() {
    const paginationElement = document.getElementById('pagination');
    if (!paginationElement) return;
    
    const totalPages = Math.ceil(filteredRisks.length / risksPerPage);
    
    paginationElement.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Botão anterior
    const prevButton = document.createElement('button');
    prevButton.className = `btn btn-sm ${currentPage === 1 ? 'btn-secondary' : 'btn-primary'}`;
    prevButton.textContent = 'Anterior';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderRisksTable();
            renderPagination();
        }
    });
    paginationElement.appendChild(prevButton);
    
    // Números das páginas
    const maxButtons = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `btn btn-sm ${i === currentPage ? 'btn-secondary' : 'btn-primary'}`;
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            renderRisksTable();
            renderPagination();
        });
        paginationElement.appendChild(pageButton);
    }
    
    // Botão próximo
    const nextButton = document.createElement('button');
    nextButton.className = `btn btn-sm ${currentPage === totalPages ? 'btn-secondary' : 'btn-primary'}`;
    nextButton.textContent = 'Próximo';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderRisksTable();
            renderPagination();
        }
    });
    paginationElement.appendChild(nextButton);
}

// Função para renderizar os gráficos
function renderCharts() {
    renderImpactChart();
    renderStatusChart();
}

// Função para renderizar o gráfico de impacto
function renderImpactChart() {
    const impactChartElement = document.getElementById('impact-chart');
    if (!impactChartElement) return;
    
    // Contar riscos por impacto
    const impactCounts = {
        'Baixo': risks.filter(risk => risk.impact === 1).length,
        'Médio': risks.filter(risk => risk.impact === 2).length,
        'Alto': risks.filter(risk => risk.impact === 3).length
    };
    
    // Criar o gráfico
    const ctx = document.createElement('canvas');
    impactChartElement.innerHTML = '';
    impactChartElement.appendChild(ctx);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(impactCounts),
            datasets: [{
                label: 'Riscos por Impacto',
                data: Object.values(impactCounts),
                backgroundColor: [
                    'rgba(21, 115, 71, 0.8)',
                    'rgba(243, 156, 18, 0.8)',
                    'rgba(195, 59, 43, 0.8)'
                ],
                borderColor: [
                    'rgba(21, 115, 71, 1)',
                    'rgba(243, 156, 18, 1)',
                    'rgba(195, 59, 43, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// Função para renderizar o gráfico de status
function renderStatusChart() {
    const statusChartElement = document.getElementById('status-chart');
    if (!statusChartElement) return;
    
    // Contar riscos por status
    const statusCounts = {};
    risks.forEach(risk => {
        if (!statusCounts[risk.status]) {
            statusCounts[risk.status] = 0;
        }
        statusCounts[risk.status]++;
    });
    
    // Criar o gráfico
    const ctx = document.createElement('canvas');
    statusChartElement.innerHTML = '';
    statusChartElement.appendChild(ctx);
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                label: 'Riscos por Status',
                data: Object.values(statusCounts),
                backgroundColor: [
                    'rgba(31, 59, 77, 0.8)',
                    'rgba(0, 178, 217, 0.8)',
                    'rgba(21, 115, 71, 0.8)',
                    'rgba(243, 156, 18, 0.8)',
                    'rgba(195, 59, 43, 0.8)'
                ],
                borderColor: [
                    'rgba(31, 59, 77, 1)',
                    'rgba(0, 178, 217, 1)',
                    'rgba(21, 115, 71, 1)',
                    'rgba(243, 156, 18, 1)',
                    'rgba(195, 59, 43, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
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

// Função para filtrar riscos
function filterRisks(filterType) {
    switch (filterType) {
        case 'all':
            filteredRisks = [...risks];
            break;
        case 'high':
            filteredRisks = risks.filter(risk => risk.impact === 3);
            break;
        case 'medium':
            filteredRisks = risks.filter(risk => risk.impact === 2);
            break;
        case 'low':
            filteredRisks = risks.filter(risk => risk.impact === 1);
            break;
        case 'identified':
            filteredRisks = risks.filter(risk => risk.status === 'Identificado');
            break;
        case 'mitigated':
            filteredRisks = risks.filter(risk => risk.status === 'Mitigado');
            break;
        default:
            filteredRisks = [...risks];
    }
    
    currentPage = 1;
    renderRisksTable();
    renderPagination();
}

// Função para buscar riscos
function searchRisks(searchTerm) {
    if (!searchTerm) {
        filteredRisks = [...risks];
    } else {
        searchTerm = searchTerm.toLowerCase();
        filteredRisks = risks.filter(risk => 
            risk.title.toLowerCase().includes(searchTerm) || 
            (risk.description && risk.description.toLowerCase().includes(searchTerm)) ||
            (risk.owner && risk.owner.toLowerCase().includes(searchTerm))
        );
    }
    
    currentPage = 1;
    renderRisksTable();
    renderPagination();
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
    // Implementar sistema de notificações
    alert(message);
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
    
    // Botão para fechar visualização
    const closeViewBtn = document.getElementById('close-view-btn');
    if (closeViewBtn) {
        closeViewBtn.addEventListener('click', () => {
            closeModal('view-risk-modal');
        });
    }
    
    // Filtro de riscos
    const riskFilter = document.getElementById('risk-filter');
    if (riskFilter) {
        riskFilter.addEventListener('change', (e) => {
            filterRisks(e.target.value);
        });
    }
    
    // Campo de busca
    const riskSearch = document.getElementById('risk-search');
    if (riskSearch) {
        riskSearch.addEventListener('input', (e) => {
            searchRisks(e.target.value);
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

