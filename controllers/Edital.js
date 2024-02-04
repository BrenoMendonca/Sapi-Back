const express = require('express');
const Edital  = require('../models/edital');
const router = express.Router();

router.post("/edital", async (req, res)=>{
    const{nameEdital, numeroEdital, dataInicio, dataFinal, objetivo,publicoAlvo, status} = req.body
    //Validações

    if(!nameEdital || !numeroEdital){
        return res.status(422).json({msg:'Campo(s) não informados '})
    }
    const EditalExists = await Edital.findOne({numeroEdital:numeroEdital})

    if(EditalExists){
        return res.status(422).json({msg:'Edital já cadastrado com esse numero'})
    }

    if(dataInicio > dataFinal || dataInicio == dataInicio ){
        return res.status(422).json({msg:'Data final não compativel'})
    }



    // Criação de uma instância do modelo Edital
    const novoEdital = new Edital({
        nameEdital,
        numeroEdital,
        dataInicio,
        dataFinal,
        objetivo,
        publicoAlvo,
        status
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