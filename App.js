//Configurações gerais
const express = require ("express");
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
dotenv.config({path: './.env'});


//Config JSON -- p/ que o express leia Json
app.use(express.json());

//Importando Models
const User = require('./models/user');



//Rota Publica
app.get("/", (req, res) => {
  res.status(200).json({msg:'Bem vindo a API Publica'})
});

//Rota Privada
/*
app.get("/user/:id" , async (req, res)=>{

const id = req.params.id

//Checando se o usuario existe
const user = await User.findById(id,'-password' )

if(!user){
  return res.status(404).json({msg: 'Usuario não encontrado'})
}
 return res.json(user);
})
*/

app.get("/user/:id", checkToken,async (req, res) => {
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

//Rota Registro de usuário
const criacaoRoutes = require('./Routes/Criacao.js'); 
app.use('/auth', criacaoRoutes);

//Rota Login
const loginRoutes = require('./Routes/Login.js'); 
app.use('/auth', loginRoutes);



//Credenciais
const DbUser = process.env.USER;
const DbPass = process.env.PASSWORD;
//Conectando ao banco
mongoose.connect(`mongodb+srv://${DbUser}:${DbPass}@cluster0.kbym7hc.mongodb.net/?retryWrites=true&w=majority`).then(()=>{
}) .catch((erro)=> console.log(erro));

  app.listen(3000,()=>{
    console.log("Conectado ao banco")
  });


