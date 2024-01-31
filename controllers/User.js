const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/user');


router.get("/:id", checkToken,async (req, res) => {
    const id = req.params.id;
  
    // Checando se o usuário existe
    const user = await User.findById(id, '-password')
      .catch((error) => {
        console.error("Erro ao buscar usuário:", error);
        return null;
      });
  
    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }
    return res.json(user);
  });
  
  //Adicionando autorização nas rotas
  function checkToken(req,res,next){
  
    const AuthHeader = req.headers['authorization']
    const token = AuthHeader && AuthHeader.split(" ")[1]
  
    if(!token){
      return req.status(401).json({msg:'Acesso Negado!'})
    }
  try{
   const secret = process.env.SECRET
  
   jwt.verify(token, secret)
  
   next()
  
  }catch(erro){
  res.status(400).json({msg:"Token inválido!"})
    }
  }

  module.exports = router;
  