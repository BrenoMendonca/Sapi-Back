const express = require('express');
const RequisitoPackage = require('../models/requisitosEdital');
const Edital = require("../models/edital");
const router = express.Router();
const authenticateToken = require("../middleware/auth.js");




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

//Aprova/Reprova requisitos de um pacote de requisitos
router.patch("/aprovar-requisitos/:editalId", authenticateToken, async (req, res) => {
    const { requisitos } = req.body; // O array de requisitos que está sendo aprovado ou reprovado

    // Validação de estrutura de dados
    if (!Array.isArray(requisitos)) {
        return res.status(400).json({ msg: "A lista de requisitos deve ser um array." });
    }

    try {
        // Busca o edital pelo ID
        const edital = await Edital.findById(req.params.editalId);
        if (!edital) {
            return res.status(404).json({ msg: "Edital não encontrado" });
        }

        // Iterar sobre os requisitos para atualizar o status
        for (const requisito of requisitos) {
            const { requisitoId, aprovado } = requisito;

            // Iterar sobre os pacotes de requisitos do edital
            for (let requisitoEdital of edital.requisitosEdital) {
                // Agora, busca o requisito pelo ID dentro dos itens
                let item = requisitoEdital.itens.find(i => i._id.toString() === requisitoId);

                // Se o item foi encontrado, atualiza seu status
                if (item) {
                    item.status = aprovado ? 'Aprovado' : 'Reprovado';
                }
            }
        }

        // Salva as alterações no edital
        await edital.save();

        return res.status(200).json({ msg: "Itens do pacote de requisitos atualizados com sucesso", edital });
    } catch (error) {
        console.error("Erro ao atualizar requisitos do edital:", error.message);
        return res.status(500).json({ msg: "Erro interno do servidor", error: error.message });
    }
});



module.exports = router;
