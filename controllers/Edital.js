const express = require('express');
const router = express.Router();
const Edital = require('../models/edital');

// ROTA LISTAGEM TODOS OS EDITAIS
router.get("/", async (req, res) => { // Rota corrigida para /getEdital
    try {
        const editais = await Edital.find(); // Consulta todos os editais
        res.json(editais);
    } catch(error) {
        res.status(500).json({ msg:'Erro ao consultar os Editais'});
    }
});

//ROTA LISTAGEM EDITAL ESPECÍFICO POR ID
router.get("/:id", async (req, res) => {
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

module.exports = router;