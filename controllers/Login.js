const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/user');



router.post('/login', async (req, res) => {

    const{matricula, password} = req.body
    //Validações
  
    if(!matricula) {
      return res.status(422).json({msg:'Matricula obrigatória '})
    }
    if(!password) {
      return res.status(422).json({msg:'Senha obrigatória '})
    }
   
  
    //Checando se a matricula está cadastrada
    const user = await User.findOne({matricula:matricula})
  
    if(!user){
      return res.status(422).json({msg:'Matricula não cadastrada'})
  }
    //Checando se a senha está correta sem a validação do bcrypt
    const checkPassword = await bcrypt.compare(password, user.password)
    //const checkPassword = await User.findOne({password:password})
    
    if(!checkPassword){
      return res.status(404).json({msg:'Senha invalida'})
    }
    //Validação de Token com o JWT --  
    try{
      const secret = process.env.SECRET
  
      const token = jwt.sign(
        {
          id: user._id,
        },
        secret,
      )
        res.status(200).json({msg:'Autenticação realizada com sucesso', token})
    }catch(erro){
      console.log(error)
  
    }
  
  
  }) 
  module.exports = router;