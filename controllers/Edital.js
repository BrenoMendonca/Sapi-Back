const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Edital = require('../models/edital');


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
router.get("id/:id", async (req, res) => {
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
        const { id } = req.params; // ID do edital
        const { matriculas } = req.body; // Array de matrículas dos usuários selecionados

        // Verifique se o edital existe
        const edital = await Edital.findById(id);
        if (!edital) {
            return res.status(404).json({ msg: 'Edital não encontrado.' });
        }

        // Verifique se há matrículas duplicadas no array
        const matriculasUnicas = [...new Set(matriculas)];
        if (matriculasUnicas.length !== matriculas.length) {
            return res.status(400).json({ msg: 'Contém matrículas duplicadas. Tente novamente.' });
        }

        // Verifique se todas as matrículas são válidas e não estão presentes como professores avaliadores
        const erros = [];
        const professoresAvaliadores = [];
        for (let matricula of matriculasUnicas) {
            const user = await User.findOne({ matricula });
            if (!user) {
                erros.push(`Usuário com a matrícula ${matricula} não encontrado ou não é um professor.`);
            } else if (edital.profsAvaliadores.some(avaliador => avaliador.matricula === user.matricula)) {
                erros.push(`Usuário com a matrícula ${matricula} já é um professor avaliador deste edital.`);
            } else {
                professoresAvaliadores.push({
                    id: user._id,
                    matricula: user.matricula,
                    nome: user.name,
                });
            }
        }

        if (erros.length > 0) {
            return res.status(400).json({ msg: 'Alguns professores não puderam ser adicionados como avaliadores.', erros });
        }

        // Adicione os professores avaliadores ao edital
        edital.profsAvaliadores.push(...professoresAvaliadores);
        await edital.save();

        res.status(201).json({ msg: 'Todos os professores avaliadores foram adicionados ao edital com sucesso.' });
    } catch(error) {
        console.error('Erro ao adicionar professores avaliadores:', error);
        res.status(500).json({ msg: 'Erro interno do servidor.' });
    }
})


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