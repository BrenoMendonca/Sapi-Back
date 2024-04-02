const express = require('express');
const Edital  = require('../models/edital');
const moment = require('moment');
const router = express.Router();


router.post("/edital", async (req, res)=>{
    const{ nameEdital, numeroEdital, dataInicio, dataFinal, objetivo,publicoAlvo, requisitosEdital } = req.body
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
    const dataInicioMoment = moment(dataInicio, 'DD/MM/YYYY');
    const dataFinalMoment = moment(dataFinal, 'DD/MM/YYYY');
    
    if (!dataInicioMoment.isValid() || !dataFinalMoment.isValid()) {
        return res.status(422).json({ msg: 'Formato de data inválido' });
    }

    if (dataInicioMoment.isSameOrAfter(dataFinalMoment)) {
        return res.status(422).json({ msg: 'A data final deve ser posterior à data de início' });
    }

    const formattedDataInicio = moment(dataInicioMoment).locale('pt-br').format('L');
    const formattedDataFinal = moment(dataFinalMoment).locale('pt-br').format('L');

    // Criação de uma instância do modelo Edital
    const novoEdital = new Edital({
        nameEdital,
        numeroEdital,
        dataInicio: formattedDataInicio,
        dataFinal: formattedDataFinal,
        objetivo,
        publicoAlvo,
        status: 1,
        requisitosEdital
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