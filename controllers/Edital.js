const express = require('express');
const router = express.Router();
const Edital = require('../models/edital');


router.get("/edital", async (req, res) => { // Rota corrigida para /getEdital
    try {
        const editais = await Edital.find(); // Consulta todos os editais
        res.json(editais);
    } catch(error) {
        res.status(500).json({ msg:'Erro ao consultar os Editais'});
    }
});

module.exports = router;