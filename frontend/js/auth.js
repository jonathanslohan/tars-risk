// Configuração da API
const API_URL = 'http://localhost:5000/api';

// Verificar se o usuário está autenticado
async function checkAuth() {
    const token = localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('user'));
    
    // Se não estiver na página de login e não tiver token, redirecionar para login
    if (!window.location.href.includes('login.html') && !token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Se estiver na página de login e tiver token, verificar se o token é válido
    if (window.location.href.includes('login.html') && token) {
        try {
            const response = await fetch(`${API_URL}/auth/check-token`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                // Token válido, redirecionar para dashboard
                window.location.href = 'index.html';
                return;
            }
        } catch (error) {
            // Token inválido, limpar localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }
    
    // Atualizar nome de usuário no header
    if (currentUser && document.getElementById('username-display')) {
        document.getElementById('username-display').textContent = currentUser.username;
    }
}

// Função para login
async function login(username, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erro ao fazer login');
        }
        
        // Armazenar dados do usuário e token
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.access_token);
        
        // Redirecionar para o dashboard
        window.location.href = 'index.html';
        
    } catch (error) {
        showAlert('login-alert', error.message);
    }
}

// Função para registro
async function register(username, email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erro ao registrar usuário');
        }
        
        // Fechar modal e mostrar mensagem de sucesso
        closeModal('register-modal');
        showAlert('login-alert', 'Usuário registrado com sucesso! Faça login para continuar.', 'success');
        
    } catch (error) {
        showAlert('register-alert', error.message);
    }
}

// Função para logout
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
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

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticação
    checkAuth();
    
    // Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            login(username, password);
        });
    }
    
    // Register Link
    const registerLink = document.getElementById('register-link');
    if (registerLink) {
        registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('register-modal');
        });
    }
    
    // Register Form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('reg-username').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-confirm-password').value;
            
            if (password !== confirmPassword) {
                showAlert('register-alert', 'As senhas não coincidem');
                return;
            }
            
            register(username, email, password);
        });
    }
    
    // Logout Button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
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

