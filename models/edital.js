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
    status:{type:Number,
        required:true
    }
},
{
    timestamps:true
}
);

const Edital = mongoose.model('Edital', editalSchema);
module.exports = Edital