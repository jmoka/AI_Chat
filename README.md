# Usando o Git

# conectar ao github
git add README.md
git commit -m "primeiro commit"
git branch -M main
git remote add origin git@github.com:jmoka/AI_Chat.git
git push -u origin main

# Realizar o primeiro commit
git status
git add . 
git commit -m "sistema base"
git push -u origin main

# Criar branck
git checkout -b testes

# Enviar as Alterações do Novo Branch
git status
git add . 
git commit -m " "
git push origin testes


# Junta os branch
git checkout main
git merge testes
git push origin main


# Deletra o branch
git branch -d testes  # Apaga localmente
git push origin --delete testes  # Apaga no remoto

========================================
# Estrutura

/server
│── /src
│   ├── /controllers     # Lógica dos endpoints (funções separadas)
│   ├── /routes          # Definição das rotas (endpoints da API)
│   ├── /models          # Modelos (caso use banco de dados)
│   ├── /middlewares     # Middlewares (autenticação, logs, validação, etc.)
│   ├── /services        # Serviços (lógica de negócios separada)
│   ├── /config          # Configurações globais (variáveis de ambiente, DB, etc.)
│   ├── app.js           # Configuração principal do servidor Express
│   ├── server.js        # Arquivo para iniciar o servidor
│
│── /tests               # Testes automatizados
│── /logs                # Logs do servidor
│── /public              # Arquivos estáticos (se precisar)
│── /docs                # Documentação da API (se precisar)
│
│── package.json         # Dependências e scripts do projeto
│── .env                 # Variáveis de ambiente
│── .gitignore           # Arquivos ignorados pelo Git
