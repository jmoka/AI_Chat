# Usando o Git

## 📡 Conectar ao GitHub
```sh
git add README.md
git commit -m "primeiro commit"
git branch -M main
git remote add origin git@github.com:jmoka/AI_Chat.git
git push -u origin main
```

## 📝 Realizar o Primeiro Commit
```sh
git status
git add . 
git commit -m "sistema base"
git push -u origin main
```

## 🌿 Criar um Novo Branch
```sh
git checkout -b testes
```

## 📤 Enviar as Alterações do Novo Branch para o GitHub
```sh
git status
git add . 
git commit -m "instruções do Git no Readme - inclusão de alterar e envio do novo branch para GitHub"
git push origin testes
```

## 🔄 Juntar os Branches
```sh
git checkout main
git merge testes
git push origin main
```

## 🗑️ Deletar o Branch Localmente
```sh
git branch -d testes  
```

## 🗑️ Deletar o Branch Remotamente
```sh
git push origin --delete testes  # Apaga no remoto
