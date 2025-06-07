# Resumo do Projeto TARS-RISK

## Visão Geral

O TARS-RISK (Threat Assessment & Reconnaissance System) é uma aplicação web completa para gerenciamento de riscos, desenvolvida com HTML5, CSS, JavaScript, Flask e PostgreSQL. A aplicação permite que usuários cadastrem, visualizem e gerenciem riscos em uma matriz nine-box interativa com funcionalidade de drag and drop.

## Principais Funcionalidades

1. **Sistema de Autenticação**
   - Registro de usuários
   - Login/logout
   - Proteção de rotas com JWT

2. **Matriz de Riscos Nine-Box**
   - Visualização de riscos por impacto e probabilidade
   - Funcionalidade de drag and drop para reclassificação
   - Cores indicativas de severidade

3. **Gerenciamento de Riscos**
   - Cadastro de novos riscos
   - Edição e exclusão de riscos existentes
   - Visualização detalhada de cada risco

4. **Banco de Dados**
   - Armazenamento persistente em PostgreSQL
   - Modelo de dados para usuários e riscos
   - Relacionamentos entre entidades

5. **Interface Responsiva**
   - Design adaptável a diferentes dispositivos
   - Estilo moderno e intuitivo
   - Incorporação dos logos da empresa

## Tecnologias Utilizadas

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)
- Drag and Drop API

### Backend
- Python
- Flask
- SQLAlchemy
- Flask-JWT-Extended
- Flask-Login

### Banco de Dados
- PostgreSQL

### Testes
- Pytest
- Testes unitários e de integração

## Estrutura do Projeto

```
tars-risk/
├── frontend/
│   ├── css/
│   │   ├── style.css
│   │   └── matrix.css
│   ├── js/
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   └── risks.js
│   ├── images/
│   │   ├── favicon.png
│   │   ├── slohanparafundoclaro-02.png
│   │   └── slohanparafundoescuro-01.png
│   ├── index.html
│   ├── login.html
│   └── risks.html
├── tars_risk_backend/
│   ├── models/
│   │   └── database.py
│   ├── routes/
│   │   ├── auth.py
│   │   └── risks.py
│   ├── static/
│   │   └── images/
│   ├── templates/
│   │   └── index.html
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_models.py
│   │   └── test_risks.py
│   ├── main.py
│   └── requirements.txt
├── README.md
├── INSTALL.md
└── USAGE.md
```

## Documentação

1. **README.md** - Visão geral do projeto, requisitos e instruções básicas
2. **INSTALL.md** - Guia detalhado de instalação para ambiente de produção
3. **USAGE.md** - Manual do usuário com instruções de uso do sistema

## Implantação

O backend está configurado para ser implantado em servidores com suporte a Python e PostgreSQL. Para ambientes de produção, recomenda-se o uso de:

- Gunicorn como servidor WSGI
- Nginx como proxy reverso
- PostgreSQL como banco de dados
- Certificado SSL para comunicação segura

## Segurança

- Senhas armazenadas com hash seguro
- Autenticação baseada em tokens JWT
- Proteção de rotas da API
- Validação de entradas do usuário

## Conclusão

O TARS-RISK é uma solução completa para gerenciamento de riscos, com interface moderna e funcionalidades avançadas. A aplicação foi desenvolvida seguindo boas práticas de programação e segurança, resultando em um produto robusto e escalável.

