const express = require('express');
const Edital  = require('../models/edital');
const moment = require('moment');
const router = express.Router();


router.post("/edital", async (req, res)=>{
    const{nameEdital, numeroEdital, dataInicio, dataFinal, objetivo,publicoAlvo, status} = req.body
    //Validações

    if(!nameEdital || !numeroEdital){
        return res.status(422).json({msg:'Campo(s) não informados '})
    }

    //Validação de dados repetidos

    //const EditalExists = await Edital.findOne({numeroEdital:numeroEdital}) 
    const [editalByNumero, editalByName] = await Promise.all([
        Edital.findOne({ numeroEdital: numeroEdital }),
        Edital.findOne({ nameEdital: nameEdital })
    ]);
    
    const EditalExists = editalByNumero && editalByName;

    if(EditalExists){
        return res.status(422).json({msg:'Edital já cadastrado com esse numero e (ou) nome'})
    }

    //Validação de datas
    
    if(dataInicio > dataFinal || dataInicio == dataFinal ){
        return res.status(422).json({msg:'Data final não compativel'})
    }

    const formattedDataInicio = moment(dataInicio).format('L');
    const formattedDataFinal = moment(dataFinal).format('L');

    // Criação de uma instância do modelo Edital
    const novoEdital = new Edital({
        nameEdital,
        numeroEdital,
        dataInicio: formattedDataInicio,
        dataFinal: formattedDataFinal,
        objetivo,
        publicoAlvo,
        status: 1
    });

    try {
        // Salvando a instância no MongoDB
        await novoEdital.save();
        return res.status(200).json({ msg: 'Edital salvo com sucesso!' });
    } catch (error) {
        console.error('Erro ao salvar edital:', error);
        return res.status(500).json({ msg: 'Erro interno do servidor' });
    }

}
)
module.exports = router;