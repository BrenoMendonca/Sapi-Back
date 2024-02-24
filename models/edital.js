const mongoose = require('mongoose');
const {Schema} = mongoose;

const editalSchema = new Schema({

    nameEdital:{type: String,
        required:true
    }, 
    numeroEdital:{type: Number,
        required:true
    },
    dataInicio:{type: Date,
        required:true
    },
    dataFinal:{type: Date,
        required:true
    },
    objetivo:{type:String,
        required:true
    },
    publicoAlvo:{type:String,
        required:true
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