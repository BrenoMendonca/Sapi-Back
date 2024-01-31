//Configurações gerais
const express = require ("express");
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
dotenv.config({path: './.env'});
import cors from "cors";

//Config JSON -- p/ que o express leia Json
app.use(express.json());

//Importando Models
const User = require('./models/user');

app.options("*", cors({
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
  preflightContinue: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}))


//Rota Publica
app.get("/", (req, res) => {
  res.status(200).json({msg:'Bem vindo a API Publica'})
});







//Rota Registro de usuário
const criacaoRoutes = require('./controllers/Login.js'); 
app.use('/auth', criacaoRoutes);

//Rota Login
const loginRoutes = require('./controllers/Login.js'); 
app.use('/auth', loginRoutes);

//Rota User 
const UserVerify = require('./controllers/User.js');
app.use('/user', UserVerify)




//Credenciais
const DbUser = process.env.USER;
const DbPass = process.env.PASSWORD;
//Conectando ao banco
mongoose.connect(`mongodb+srv://${DbUser}:${DbPass}@cluster0.kbym7hc.mongodb.net/?retryWrites=true&w=majority`).then(()=>{
}) .catch((erro)=> console.log(erro));

  app.listen(3001,()=>{
    console.log("Conectado ao banco")
  });


