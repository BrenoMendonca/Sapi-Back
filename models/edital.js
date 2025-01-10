const mongoose = require('mongoose');
const {Schema} = mongoose;

const editalSchema = new Schema({
    creatorEdital: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    nameEdital: {
        type: String,
        required: true
    },
    numeroEdital: {
        type: String,
        required: true
    },
    dataInicio: {
        type: String,
        required: true
    },
    dataFinal: {
        type: String,
        required: true
    },
    objetivo: {
        type: String,
        required: true
    },
    publicoAlvo: {
        type: String
    },
    status: {
        type: String,
        enum: ['Aberto', 'Submissão', 'Em analise', 'Aprovado'], 
        required: true
    },
    requisitosEdital: [{
        pacoteId: { 
            type: Schema.Types.ObjectId, 
            ref: 'RequisitoPackage', // Referência ao pacote original
            required: true 
        },
        nameRequisito: { 
            type: String, 
            required: true 
        }, // Nome do pacote de requisitos
        itens: [{
            descricao: { 
                type: String, 
                required: true 
            }, // Descrição do item
            status: { 
                type: String, 
                enum: ['Aprovado', 'Reprovado', 'Pendente'], 
                default: 'Pendente' 
            } // Status do item
        }]
    }],
    profsAvaliadores: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Referência ao modelo 'User'
    }],
    submissoes: [{
        type: Schema.Types.ObjectId,
        ref: 'Submissao'
    }],
    linkEdital: {
        type: String
    }
}, {
    timestamps: true
});

const Edital = mongoose.model('Edital', editalSchema);
module.exports = Edital;
