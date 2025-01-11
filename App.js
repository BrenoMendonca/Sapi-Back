//Configurações gerais
const express = require ("express");
const cors = require('cors');
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const app = express();
dotenv.config({path: './.env'});
require('dotenv').config();
console.log(process.env.USER)
console.log(process.env.PASSWORD)

//Config JSON -- p/ que o express leia Json
app.use(express.json());




app.use(cors({
  origin: 'http://localhost:3000',  
  optionsSuccessStatus: 200,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));


//Rota Publica
app.get("/", (req, res) => {
  res.status(200).json({msg:'Bem vindo a API Publica'})
});


//Rota Registro de usuário
const criacaoRoutes = require('./controllers/CriacaoUser.js'); 
app.use('/auth', criacaoRoutes);

//Rota Login
const loginRoutes = require('./controllers/Login.js'); 
app.use('/auth', loginRoutes);

//Rota User 
const UserVerify = require('./controllers/User.js');
app.use('/user', UserVerify)

//Rota Criacao Edital
const getEdital= require('./controllers/Edital.js');
app.use('/edital', getEdital)

//Rota puxar editais
const criacaoEdital = require('./controllers/CriacaoEdital.js')
app.use('/edital', criacaoEdital)

//Rota requisitos edital
const requisitosEdital = require('./controllers/RequisitosEdital.js')
app.use('/requisitos', requisitosEdital)

//Rota Criacao requisitos edital
const criacaoRequisitosEdital = require('./controllers/CriacaoRequisitosEdital.js')
app.use('/requisitos', criacaoRequisitosEdital)

const submissao = require('./controllers/Submissao.js')
app.use('/submissao', submissao)

//Credenciais
const DbUser = process.env.DB_USER;
const DbPass = process.env.DB_PASSWORD;
//Conectando ao banco
console.log(DbUser)
console.log(DbPass)
mongoose.connect(`mongodb+srv://${DbUser}:${DbPass}@cluster0.kbym7hc.mongodb.net/?retryWrites=true&w=majority`).then(()=>{
}) .catch((erro)=> console.log(erro));

  app.listen(3001,()=>{
    console.log("Conectado ao banco")
  });


