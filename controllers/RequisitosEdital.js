const express = require('express');
const RequisitoPackage = require('../models/requisitosEdital');
const router = express.Router();

// ROTA CRIAÇÃO REQUISITOS EDITAL
router.post("/criacao", async (req, res) => {
    const { nameRequisito, requisitos } = req.body;

    // Validações de campos obrigatórios
    if (!nameRequisito || !requisitos) {
        return res.status(422).json({ msg: 'Campo(s) não informados' });
    }

    // Validação de dados repetidos
    const [requisitoByName] = await Promise.all([
        RequisitoPackage.findOne({ nameRequisito: nameRequisito }) // Alterei para usar RequisitoPackage
    ]);

    const requisitoExists = requisitoByName;
    if (requisitoExists) {
        return res.status(422).json({ msg: 'Requisito de edital já cadastrado com esse nome' });
    }

    // Criação do novo pacote de requisitos
    const novoRequisitoPackage = new RequisitoPackage({
        nameRequisito,
        requisitos
    });

    try {
        // Salvando o novo pacote de requisitos
        await novoRequisitoPackage.save();
        return res.status(200).json({ msg: 'Requisito de edital salvo com sucesso!' });
    } catch (error) {
        console.error('Erro ao salvar requisito:', error);
        return res.status(500).json({ msg: 'Erro interno do servidor' });
    }
});

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
