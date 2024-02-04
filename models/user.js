const mongoose = require('mongoose');

const User = mongoose.model('User',{
  name:{type: String,
        required:true
  },
  email:{type: String,
    required:true
  },
  password:{type: String,
    required:true   
  },
  confirmpassword:{type: String,
    required:true
  },
  matricula:{type: String,
    required:true,
  },
  cpf:{type: String,
    required:true
  },
})
//Adicionar validação numerica na String de matricula
module.exports = User