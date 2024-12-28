const express = require('express');
const RequisitoPackage = require('../models/requisitosEdital');
const router = express.Router();



// ROTA PUXA TODOS OS REQUISITOS CADASTRADOS
router.get("/", async (req, res) => {
    try {
        const requisitos = await RequisitoPackage.find(); // Consulta todos os pacotes de requisitos
        res.json(requisitos);
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao consultar os requisitos dos editais' });
    }
});

// ROTA LISTAGEM EDITAL ESPECÍFICO POR ID
router.get("/:id", async (req, res) => {
    try {
        const requisitoEdital = await RequisitoPackage.findById(req.params.id);
        if (!requisitoEdital) {
            return res.status(404).json({ msg: 'Requisito de edital não encontrado' });
        }
        res.json(requisitoEdital);
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao consultar o requisito de edital', error });
    }
});

module.exports = router;
