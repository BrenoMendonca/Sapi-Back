const mongoose = require('mongoose');
const {Schema} = mongoose;

const editalSchema = new Schema({


    creatorEdital: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    nameEdital:{type: String,
        required:true
    }, 
    numeroEdital:{type: String,
        required:true
    },
    dataInicio:{type: String,
        required:true
    },
    dataFinal:{type: String,
        required:true
    },
    objetivo:{type:String,
        required:true
    },
    publicoAlvo:{type:String,
    },  
    criador:{type:String,
    },
    status:{type:Number,
        required:true
    },
    requisitosEdital: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RequisitoPackage',
        required: true
    }],
    profsAvaliadores: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referencia o modelo 'User'
      }],
    submissoes: [{
        type: Schema.Types.ObjectId,
        ref: 'Submissao'
    }],
    linkEdital: {type: String}

},
{
    timestamps:true
}
);

const Edital = mongoose.model('Edital', editalSchema);
module.exports = Edital