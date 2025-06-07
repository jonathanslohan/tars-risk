# TARS-RISK

TARS-RISK (Threat Assessment & Reconnaissance System) é uma ferramenta para gerenciamento de riscos, onde eles podem ser cadastrados e são apresentados em uma matriz nine-box de riscos.

## Funcionalidades

- Autenticação de usuários
- Cadastro e gerenciamento de riscos
- Matriz de riscos nine-box interativa com drag and drop
- Visualização e edição de riscos
- Integração com banco de dados PostgreSQL

## Estrutura do Projeto

O projeto está dividido em duas partes principais:

### Frontend

O frontend foi desenvolvido com HTML5, CSS e JavaScript puro, oferecendo uma interface responsiva e interativa.

- `frontend/`: Contém todos os arquivos do frontend
  - `css/`: Arquivos de estilo
  - `js/`: Scripts JavaScript
  - `images/`: Imagens e logos
  - `index.html`: Página principal com a matriz de riscos
  - `login.html`: Página de login
  - `risks.html`: Página de gerenciamento de riscos

### Backend

O backend foi desenvolvido com Flask e SQLAlchemy, fornecendo uma API RESTful para gerenciar os dados.

- `tars_risk_backend/`: Contém todos os arquivos do backend
  - `models/`: Modelos de dados
  - `routes/`: Rotas da API
  - `static/`: Arquivos estáticos
  - `templates/`: Templates HTML
  - `main.py`: Arquivo principal do backend

## Requisitos

- Python 3.8+
- PostgreSQL 12+
- Navegador moderno com suporte a HTML5 e CSS3

## Instalação

### 1. Configuração do Banco de Dados

```bash
# Criar usuário e banco de dados PostgreSQL
sudo -u postgres psql -c "CREATE USER tars_risk WITH PASSWORD 'tars_risk_password';"
sudo -u postgres psql -c "CREATE DATABASE tars_risk_db OWNER tars_risk;"
```

### 2. Configuração do Backend

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/tars-risk.git
cd tars-risk/tars_risk_backend

# Criar e ativar ambiente virtual
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Iniciar o servidor
python main.py
```

O servidor backend estará disponível em `http://localhost:5000`.

### 3. Configuração do Frontend

O frontend pode ser servido por qualquer servidor web. Para desenvolvimento, você pode usar o servidor HTTP do Python:

```bash
cd tars-risk/frontend
python -m http.server 8000
```

O frontend estará disponível em `http://localhost:8000`.

## Uso

1. Acesse `http://localhost:8000/login.html` para fazer login
2. Use as credenciais padrão:
   - Usuário: `admin`
   - Senha: `admin123`
3. Após o login, você será redirecionado para o dashboard com a matriz de riscos
4. Para adicionar um novo risco, clique no botão "Novo Risco"
5. Para mover um risco na matriz, arraste-o para a célula desejada
6. Para editar ou excluir um risco, use os botões na tabela de riscos

## Matriz de Riscos

A matriz de riscos é uma ferramenta visual que ajuda a classificar os riscos com base em dois fatores:

- **Impacto**: O efeito potencial do risco (Baixo, Médio, Alto)
- **Probabilidade**: A chance de ocorrência do risco (Baixa, Média, Alta)

Os riscos são representados como cartões na matriz e podem ser movidos entre as células através de drag and drop, atualizando automaticamente sua classificação no banco de dados.

## API

O backend fornece uma API RESTful com os seguintes endpoints:

- `GET /api/status`: Verifica o status da API
- `POST /api/auth/register`: Registra um novo usuário
- `POST /api/auth/login`: Autentica um usuário
- `POST /api/auth/logout`: Encerra a sessão do usuário
- `GET /api/risks/`: Obtém todos os riscos do usuário atual
- `POST /api/risks/`: Cria um novo risco
- `GET /api/risks/{id}`: Obtém um risco específico
- `PUT /api/risks/{id}`: Atualiza um risco existente
- `DELETE /api/risks/{id}`: Exclui um risco

## Segurança

A autenticação é feita usando JWT (JSON Web Tokens). Todas as rotas da API, exceto login e registro, requerem um token válido.

## Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Contato

Para mais informações, entre em contato com a equipe TARS-RISK.

