const jwt = require('jsonwebtoken');
require('dotenv').config(); 
const secret = process.env.SECRET; 

// Middleware para validar o token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Log para verificar se o token está presente
  console.log('Token recebido:', token);

  if (!token) {
    return res.status(401).json({ msg: 'Token não fornecido' });
  }

  jwt.verify(token, secret, (err, user) => {
    // Log de erro se o token for inválido
    if (err) {
      console.error('Erro ao verificar o token:', err);
      return res.status(403).json({ msg: 'Token inválido' });
    }

    // Log para verificar os dados do usuário após a decodificação
    console.log('Usuário decodificado:', user);

    req.user = user; // Decodifica os dados do token e os armazena na requisição
    next();
  });
};


module.exports = authenticateToken;
