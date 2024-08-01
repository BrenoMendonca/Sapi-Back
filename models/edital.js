const mongoose = require('mongoose');
const {Schema} = mongoose;

const editalSchema = new Schema({

    nameEdital:{type: String,
        required:true
    }, 
    numeroEdital:{type: Number,
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
    requisitosEdital:{type:Array,
    },
    profsAvaliadores:{type:Array
    },
    submissoes: [{
        type: Schema.Types.ObjectId,
        ref: 'Submissao'
    }],

},
{
    timestamps:true
}
);

const Edital = mongoose.model('Edital', editalSchema);
module.exports = Edital