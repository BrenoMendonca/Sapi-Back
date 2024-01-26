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
app.get("/user/:id", async(req, res)=>{

  const id = req.params.id

  const user = await User.findById(id,'-password')
})


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


