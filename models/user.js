const mongoose = require('mongoose');

const User = mongoose.model('User',{
  name:String,
  email:String,
  password:String,
  confirmpassword:String,
  matricula:String,
})
//Adicionar validação numerica na String de matricula
module.exports = User