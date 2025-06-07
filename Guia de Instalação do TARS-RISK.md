# Guia de Instalação do TARS-RISK

Este guia fornece instruções detalhadas para instalar e configurar o TARS-RISK em um ambiente de produção.

## Requisitos de Sistema

- Sistema operacional: Linux (recomendado Ubuntu 20.04+) ou Windows Server 2019+
- Python 3.8+
- PostgreSQL 12+
- Nginx ou Apache (para produção)
- 2GB de RAM (mínimo)
- 10GB de espaço em disco

## Instalação Passo a Passo

### 1. Preparação do Ambiente

```bash
# Atualizar o sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install -y python3-pip python3-venv postgresql postgresql-contrib nginx git
```

### 2. Configuração do PostgreSQL

```bash
# Iniciar o serviço PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar usuário e banco de dados
sudo -u postgres psql -c "CREATE USER tars_risk WITH PASSWORD 'tars_risk_password';"
sudo -u postgres psql -c "CREATE DATABASE tars_risk_db OWNER tars_risk;"
```

### 3. Instalação do TARS-RISK

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/tars-risk.git
cd tars-risk

# Configurar o backend
cd tars_risk_backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configurar variáveis de ambiente (produção)
echo "export SECRET_KEY='sua_chave_secreta_aqui'" >> .env
echo "export JWT_SECRET_KEY='sua_chave_jwt_aqui'" >> .env
echo "export SQLALCHEMY_DATABASE_URI='postgresql://tars_risk:tars_risk_password@localhost/tars_risk_db'" >> .env
```

### 4. Configuração do Gunicorn (para produção)

```bash
# Instalar Gunicorn
pip install gunicorn

# Criar arquivo de serviço systemd
sudo nano /etc/systemd/system/tars-risk.service
```

Adicione o seguinte conteúdo ao arquivo:

```ini
[Unit]
Description=TARS-RISK Gunicorn Service
After=network.target postgresql.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/caminho/para/tars-risk/tars_risk_backend
Environment="PATH=/caminho/para/tars-risk/tars_risk_backend/venv/bin"
EnvironmentFile=/caminho/para/tars-risk/tars_risk_backend/.env
ExecStart=/caminho/para/tars-risk/tars_risk_backend/venv/bin/gunicorn --workers 3 --bind 0.0.0.0:5000 "main:create_app()"
Restart=always

[Install]
WantedBy=multi-user.target
```

Inicie o serviço:

```bash
sudo systemctl start tars-risk
sudo systemctl enable tars-risk
```

### 5. Configuração do Nginx (para produção)

```bash
# Criar configuração do Nginx
sudo nano /etc/nginx/sites-available/tars-risk
```

Adicione o seguinte conteúdo ao arquivo:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        root /caminho/para/tars-risk/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

Ative a configuração:

```bash
sudo ln -s /etc/nginx/sites-available/tars-risk /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Configuração de HTTPS (recomendado para produção)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com
```

### 7. Configuração do Firewall

```bash
# Configurar UFW
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
```

## Verificação da Instalação

1. Verifique o status do serviço backend:
   ```bash
   sudo systemctl status tars-risk
   ```

2. Verifique os logs do backend:
   ```bash
   sudo journalctl -u tars-risk
   ```

3. Teste a API:
   ```bash
   curl http://localhost:5000/api/status
   ```

4. Acesse o frontend em seu navegador:
   ```
   http://seu-dominio.com
   ```

## Manutenção

### Backup do Banco de Dados

```bash
# Backup do banco de dados
pg_dump -U tars_risk -W tars_risk_db > backup_$(date +%Y%m%d).sql
```

### Atualização do Sistema

```bash
# Atualizar o código
cd /caminho/para/tars-risk
git pull

# Atualizar dependências do backend
cd tars_risk_backend
source venv/bin/activate
pip install -r requirements.txt

# Reiniciar o serviço
sudo systemctl restart tars-risk
```

## Solução de Problemas

### Problema: O serviço não inicia

Verifique os logs:
```bash
sudo journalctl -u tars-risk -n 50
```

### Problema: Erro de conexão com o banco de dados

Verifique se o PostgreSQL está em execução:
```bash
sudo systemctl status postgresql
```

Verifique as credenciais do banco de dados:
```bash
sudo -u postgres psql -c "SELECT 1 FROM pg_roles WHERE rolname='tars_risk';"
```

### Problema: Erro 502 Bad Gateway

Verifique se o Gunicorn está em execução:
```bash
ps aux | grep gunicorn
```

Verifique a configuração do Nginx:
```bash
sudo nginx -t
```

## Suporte

Para obter suporte adicional, entre em contato com a equipe TARS-RISK.

