//Configurações gerais
const express = require ("express");
const cors = require('cors');
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
const Edital  = require('./models/edital.js');

/*
app.options("*", cors({
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
  preflightContinue: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}))
*/
app.use(cors({
  origin: 'http://localhost:3000',  // Origem do seu frontend
  optionsSuccessStatus: 200,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Adicione cabeçalhos permitidos, se necessário
}));

/*
app.use((req, res, next) => {
	//Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
    res.header("Access-Control-Allow-Origin", "*");
	//Quais são os métodos que a conexão pode realizar na API
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
    app.use(cors());
    next();
});
*/
/*
app.use(cors({
  origin: 'http://localhost:3000',  // Origem do seu frontend
  optionsSuccessStatus: 200,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
*/

//Rota Publica
app.get("/", (req, res) => {
  res.status(200).json({msg:'Bem vindo a API Publica'})
});


//Rota Registro de usuário
const criacaoRoutes = require('./controllers/Criacao.js'); 
app.use('/auth', criacaoRoutes);

//Rota Login
const loginRoutes = require('./controllers/Login.js'); 
app.use('/auth', loginRoutes);

//Rota User 
const UserVerify = require('./controllers/User.js');
app.use('/user', UserVerify)

//Rota Criacao Edital
const getEdital= require('./controllers/Edital.js');
app.use('/getEdital', getEdital)

//Rota puxar editais
const criacaoEdital = require('./controllers/CriacaoEdital.js')
app.use('/criacao', criacaoEdital)


//Credenciais
const DbUser = process.env.USER;
const DbPass = process.env.PASSWORD;
//Conectando ao banco
mongoose.connect(`mongodb+srv://${DbUser}:${DbPass}@cluster0.kbym7hc.mongodb.net/?retryWrites=true&w=majority`).then(()=>{
}) .catch((erro)=> console.log(erro));

  app.listen(3001,()=>{
    console.log("Conectado ao banco")
  });


