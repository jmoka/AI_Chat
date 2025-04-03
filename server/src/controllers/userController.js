exports.getUsers = (req, res) => {
    res.json({ message: 'Lista de usuários' });
  };
  
  exports.createUser = (req, res) => {
    res.json({ message: 'Usuário criado' });
  };