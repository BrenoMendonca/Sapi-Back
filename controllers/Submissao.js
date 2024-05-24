const express = require('express');
const Submissao  = require('../models/submissao');
const Edital  = require('../models/edital');
const User = require('../models/user');
const mongoose = require('mongoose');
const router = express.Router();

//CRIAR SUBMISSÃO
router.post('/submissao', async (req, res) => {
    try {
        const { matricula, edital, title, description } = req.body;

        if (!matricula || !edital || !title || !description) {
            return res.status(422).json({ msg: 'Dados de entrada incompletos.' });
        }

        const prof = await User.findOne({ matricula });

        if (!prof) {
            return res.status(422).json({ msg: 'Professor não encontrado ou inexistente.' });
        }

        if (!mongoose.Types.ObjectId.isValid(edital)) {
            return res.status(422).json({ msg: 'ID do edital inválido.' });
        }

        const editalDoc = await Edital.findById(edital);

        if (!editalDoc) {
            return res.status(422).json({ msg: 'Edital não encontrado ou inexistente.' });
        }

        const submission = new Submissao({
            prof: prof._id,
            edital: editalDoc._id,
            title,
            description
        });

        await submission.save()
        
        editalDoc.submissoes.push(submission._id);
        await editalDoc.save();

        return res.status(201).json(submission);
    } catch (e) {
        return res.status(500).json({ msg: 'Erro interno do servidor.' , error: e })    }
})

//LISTAR SUBMISSÕES DE UM EDITAL
router.get('/getEdital/:id/submissoes/', async (req, res) => {
    try {
        const editalId = req.params.id

        const edital = await Edital.findById(editalId).populate('submissoes')

        if (!edital) {
            return res.status(404).json({ msg: 'Edital não encontrado.' })
        }

        return res.status(200).json(edital.submissoes)
    } catch (e) {
        console.error(e)
    }
})

//LISTAR SUBMISSÃO DE UM EDITAL ESPECÍFICO
router.get('/submissoes/:idSubmissao', async (req, res) => {
    try {
        const { idSubmissao } = req.params
        
        if (idSubmissao.length !== 24) {
            return res.status(404).json({ msg: 'ID inválido.' })
        }
        
        const submissao = await Submissao.findById(idSubmissao)

        if (!submissao) {
            return res.status(404).json({ msg: 'Submissão não encontrada.' })
        }

        return res.status(200).send(submissao)
    } catch (e) {
        console.error(e)
    }
})

module.exports = router;
