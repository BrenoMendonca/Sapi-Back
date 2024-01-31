const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/user');

router.post('/register', async (req, res) => {
    const {name, email,matricula, password,confirmpassword,cpf} = req.body
    //Validações
    if(!name) {
      return res.status(422).json({msg:'Nome obrigatório '})
    }
    if(!email) {
      return res.status(422).json({msg:'Email obrigatório '})
    }
    if(!matricula) {
      return res.status(422).json({msg:'Matricula obrigatória '})
    }
    if(!password) {
      return res.status(422).json({msg:'Senha obrigatória '})
    }
    if(password !== confirmpassword){
    return res.status(422).json({msg:'As senhas devem ser iguais'})
    }


  //Checando se o usuário existe
  const EmailExists = await User.findOne({email:email})

  if(EmailExists){
    return res.status(422).json({msg:'Email já cadastrado'})
  }

  const MatriculaExists = await User.findOne({matricula:matricula})

  if(MatriculaExists){
    return res.status(422).json({msg:'Matricula já cadastrada'})
  }

  const CPFExists = await User.findOne({cpf:cpf})

  if(CPFExists){
    return res.status(422).json({msg:'Cpf já cadastrado'})
  }


  //Validações de CPF e Matricula
  if (/^\d{7}$/.test(matricula)) {
  } else {
    return res.status(422).json({msg:'Matricula com números incorretos ou não numericos'});
  }

  if (/^\d{11}$/.test(cpf)) {
  } else {
    return res.status(422).json({msg:'Cpf com números incorretos ou não numericos'});
  }


  //Criando senha e adicionando segurança
  const salt = await bcrypt.genSalt(12)
  const passwordHash = await bcrypt.hash(password, salt)


  // Criando usuário no banco
  const user = new User({
    name,
    email,
    password: passwordHash,//para deixar a senha encriptada
    confirmpassword,
    matricula,
    cpf
  })
  try {
    await user.save()

    res.status(201).json({msg:'Usuario criado com sucesso!'})
  }catch(error) {
      console.log(error)
      res.status(500).json({msg:'Aconteceu um erro no servidor'})
    }
  }
)

module.exports = router;

