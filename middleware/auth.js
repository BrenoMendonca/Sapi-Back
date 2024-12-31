const jwt = require('jsonwebtoken');
require('dotenv').config(); // Carrega variáveis do arquivo .env
const secret = process.env.SECRET; // Usa a variável de ambiente SECRET

// Middleware para validar o token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ msg: 'Token não fornecido' });
  }

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      
      return res.status(403).json({ msg: 'Token inválido' });
    }
    req.user = user; // Decodifica os dados do token e os armazena na requisição
    next();
  });
};

module.exports = authenticateToken;
