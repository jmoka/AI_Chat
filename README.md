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


# Junta os branch
git checkout main
git merge testes
git push origin main


# Deletra o branch
git branch -d testes  # Apaga localmente
git push origin --delete testes  # Apaga no remoto