const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
 
  name:{type: String,
    required:true
  },
  email:{type: String,
    required:true
  },
  password:{type: String,
    required:true   
  },
  
  matricula:{type: String,
    required:true,
  },
  cpf:{type: String,
    required:true
  },
  curso:{
    type: String
  },
  typeOfUser:{
    type: Number,
  }
},
{
  timestamps: true
}
);

const User = mongoose.model('User', userSchema);
module.exports = User;