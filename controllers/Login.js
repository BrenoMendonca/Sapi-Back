const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/user');



router.post('/login', async (req, res) => {

    const{matricula, password} = req.body
    //Validações
  
    if(!matricula && !password) {
      return res.status(422).json({msg:'Credenciais obrigatórias '})
    }
    if(!matricula) {
      return res.status(422).json({msg:'Matricula obrigatória '})
    }
    if(!password) {
      return res.status(422).json({msg:'Senha obrigatória '})
    }
   
  
    //Checando se a matricula está cadastrada
    const user = await User.findOne({matricula:matricula});
    
    /*
    try {
      const user = await User.findOne({matricula:matricula});
      const { name } = user
    } catch (error) {
      return res.status(422).json({msg:'Usuário não encontrado '});
         }
    */
    
  
    if(!user){
      return res.status(422).json({msg:'Matricula não cadastrada'})
  }
    //Checando se a senha está correta sem a validação do bcrypt
    const checkPassword = await bcrypt.compare(password, user.password)
    
    //const checkPassword = await User.findOne({password:password})
    console.log(checkPassword)
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
        const { name } = user
        
        res.status(200).json({msg:'Autenticação realizada com sucesso ', user: { token, matricula, name }})
    }catch(erro){
      console.log(erro)
  
    }
  
  
  }) 
  module.exports = router;