const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/user');

/* typeOfUser:{
  0: prof
  1: prof mestre
  2: prof doutor
  100: admin
} */

router.post('/register', async (req, res) => {
    const { name, email, matricula, password, cpf, typeOfUser, curso } = req.body
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
    
    if(!curso) {
      return res.status(422).json({msg:'Curso não informado '})
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
  if (/^\d{9}$/.test(matricula)) {
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


  // Validação de tipo de usuário
  if (typeof typeOfUser !== 'undefined' && !['0', '1', '2', '100'].includes(typeOfUser)) {
    return res.status(422).json({ msg: 'Tipo de usuário inválido' });
  }

  // Definir typeOfUser como 1 se não for fornecido no corpo da requisição
  const finalTypeOfUser = typeof typeOfUser !== 'undefined' ? typeOfUser : 1;
  // Criando usuário no banco
  const user = new User({
    name,
    email,
    password: passwordHash, // para deixar a senha encriptada
    matricula,
    cpf,
    typeOfUser: finalTypeOfUser,
    curso
  });

  try {
    await user.save()

    res.status(201).json({ msg:'Usuario criado com sucesso!' })
  }catch(error) {
      console.log(error)
      res.status(500).json({msg:'Aconteceu um erro no servidor'})
    }
  }
)

module.exports = router;

