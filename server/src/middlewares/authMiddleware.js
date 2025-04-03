module.exports = (req, res, next) => {
    console.log('Middleware de autenticação');
    next();
  };
  