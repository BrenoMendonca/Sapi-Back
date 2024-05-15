const express = require('express');
const Submissao  = require('../models/submissao');
const Edital  = require('../models/edital');
const User = require('../models/user');
const mongoose = require('mongoose');
const router = express.Router();

router.post('/submissao', async (req, res) => {
    try {
        const { profId, editalId, title } = req.body

        if (!profId || !editalId || !title) {
            return res.status(422).json({ msg: 'Dados de entrada incompletos.' })
        }

        if (!mongoose.Types.ObjectId.isValid(profId) || !mongoose.Types.ObjectId.isValid(editalId)) {
            return res.status(422).json({ msg: 'IDs de professor ou edital inválidos.' })
        }

        const edital = await Edital.findOne({ _id: editalId })
        const prof = await User.findOne({ _id: profId })
        
        if (!edital) {
            return res.status(422).json({ msg: 'Edital não encontrado ou inexistente.'})
        }

        if (!prof) {
            return res.status(422).json({ msg: 'Professor não encontrado ou inexistente.'})
        }

        const submission = new Submissao({
            prof: profId,
            edital: editalId,
            title
        })

        await submission.save()

        edital.submissoes.push(submission)
        await edital.save()

        return res.status(201).json(submission)
    } catch (e) {
        return res.status(500).json({ msg: 'Erro interno do servidor.' , error: e })    }
})

router.get('/getEdital/:id/submissoes/', async (req, res) => {
    try {
        const editalId = req.params.id
        console.log(editalId)

        const edital = await Edital.findById(editalId).populate('submissoes')

        if (!edital) {
            return res.status(404).json({ msg: 'Edital não encontrado.' })
        }

        return res.status(200).json(edital.submissoes)
    } catch (e) {
        console.error(e)
    }
})

module.exports = router;
