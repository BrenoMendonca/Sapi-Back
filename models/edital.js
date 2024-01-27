const mongoose = require('mongoose');


const Edital = mongoose.model('edital',{

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
    omitbjetivo:{type:String,
        required:true
    },
    publicoAlvo:{type:String,
        required:true
    },
    status:{type:Number,
        required:true
    }

})

module.exports = Edital