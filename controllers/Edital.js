const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Edital = require('../models/edital');
const mongoose = require('mongoose');
require('dotenv').config();
const authenticateToken = require('../middleware/auth');
const masterPassword = process.env.SECRET;          

//PESQUISA EDITAIS

// Rota listagem todos os editais
router.get("/", async (req, res) => { // Rota corrigida para /getEdital
    try {
        const editais = await Edital.find(); // Consulta todos os editais
        res.json(editais);
    } catch(error) {
        res.status(500).json({ msg:'Erro ao consultar os Editais'});
    }
});

//ROTA LISTAGEM EDITAL ESPECÍFICO POR ID
router.get("/id/:id",authenticateToken, async (req, res) => {
    try {
        const edital = await Edital.findById(req.params.id);
        if (!edital) {
            return res.status(404).json({ msg: 'Edital não encontrado' });
        }
        res.json(edital);
    } catch(error) {
        res.status(500).json({ msg:'Erro ao consultar o Edital', error});
    }
})

// ADICIONAR PROFESSOR COMO AVALIADOR
router.post('/add-prof-avaliador/:id', async (req, res) => {
  try {
    const editalId = req.params.id;
    const { avaliadores } = req.body;

    if (!avaliadores || !Array.isArray(avaliadores) || avaliadores.length === 0) {
      return res.status(400).json({ message: 'Por favor, forneça uma lista válida de avaliadores.' });
    }

    const avaliadoresObjectId = avaliadores.map(id => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`ID inválido encontrado: ${id}`);
      }
      return new mongoose.Types.ObjectId(id);
    });

    const edital = await Edital.findById(editalId);
    if (!edital) {
      return res.status(404).json({ message: 'Edital não encontrado.' });
    }

    if (!Array.isArray(edital.profsAvaliadores)) {
      edital.profsAvaliadores = [];
    }

    if (edital.profsAvaliadores.length + avaliadoresObjectId.length > 3) {
      return res.status(400).json({ message: 'Você só pode adicionar até 3 avaliadores ao edital.' });
    }

    const novosAvaliadores = avaliadoresObjectId.filter(
      id => !edital.profsAvaliadores.some(existingId => existingId.equals(id))
    );

    edital.profsAvaliadores.push(...novosAvaliadores);
    await edital.save();

    return res.status(200).json({ message: 'Avaliadores adicionados com sucesso ao edital.' });
  } catch (error) {
    console.error('Erro ao adicionar avaliadores ao edital:', error.message);
    return res.status(500).json({ message: 'Erro ao processar a requisição.', error: error.message });
  }
});
  




//Remove professor avaliador
router.delete('/remove-prof-avaliador/:id', async (req,res) => {
    try {
        const { id } = req.params
        const { matricula } = req.body

        const edital = await Edital.findById(id)
        if (!edital) {
            return res.status(404).json({ msg: 'Edital não encontrado.' });
        }
        
        const index = edital.profsAvaliadores.findIndex(avaliador => avaliador.matricula === matricula);

        if (index === -1) {
            return res.status(404).json({ msg: 'Professor avaliador não encontrado neste edital' });
        }

        edital.profsAvaliadores.splice(index, 1);
        await edital.save();

        return res.status(200).json({ msg: `Professor de matrícula ${matricula} retirado como avaliador` })
    } catch (error) {
        console.error('Erro ao remover professor avaliador:', error);
        res.status(500).json({ msg: 'Erro interno do servidor' });
    }
})

module.exports = router;