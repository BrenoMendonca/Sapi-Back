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

        return res.status(201).json({ msg: 'Submissão criada com sucesso.' })
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
            .populate('prof')
            .populate('edital')

        if (!submissao) {
            return res.status(404).json({ msg: 'Submissão não encontrada.' })
        }

        return res.status(200).send(submissao)
    } catch (e) {
        console.error(e)
    }
})

router.patch('/submissoes/validate/:idSubmissao', async (req, res) => {
    try {
        const { idSubmissao } = req.params;
        const submission = await Submissao.findById(idSubmissao);

        if (!submission) {
            return res.status(404).json({ msg: 'Submissão não encontrada.' });
        }

        if (!submission.areReqsValidated) { 
            submission.areReqsValidated = true;
            await submission.save();

            return res.status(200).json({ msg: 'Requisitos do edital validados com sucesso.' });
        } 

        return res.status(202).json({ msg: 'Requisitos do edital já haviam sido validados.' });
    } catch (error) {
        console.error('Erro ao validar os requisitos:', error);
        res.status(500).json({ msg: 'Erro interno do servidor' });
    }
});

router.patch('/submissoes/invalidate/:idSubmissao', async (req, res) => {
    try {
        const { idSubmissao } = req.params;
        const submission = await Submissao.findById(idSubmissao);

        if (!submission) {
            return res.status(404).json({ msg: 'Submissão não encontrada.' });
        }

        if (submission.areReqsValidated) { 
            submission.areReqsValidated = false;
            await submission.save();

            return res.status(200).json({ msg: 'Requisitos do edital invalidados.' });
        } 

        return res.status(202).json({ msg: 'Requisitos do edital ainda não foram validados.' });
    } catch (error) {
        console.error('Erro ao invalidar os requisitos:', error);
        res.status(500).json({ msg: 'Erro interno do servidor' });
    }
});

// Aprovar Submissão
router.patch('/submissoes/approve/:idSubmissao', async (req, res) => {
    try {
        const { idSubmissao } = req.params;
        const { feedback } = req.body;

        const submissao = await Submissao.findById(idSubmissao);

        if (!submissao) {
            return res.status(404).json({ msg: 'Submissão não encontrada.' });
        }

        if (submissao.status === 'aprovada') {
            return res.status(400).json({ msg: 'Submissão já aprovada.' });
        }
       
        submissao.status = 'aprovada';
        submissao.feedback = feedback || '';
        await submissao.save();

        res.status(200).json({ msg: 'Submissão aprovada com sucesso.' });
    } catch (error) {
        console.error('Erro ao aprovar submissão:', error);
        res.status(500).json({ msg: 'Erro interno do servidor' });
    }
});

// Reprovar Submissão
router.patch('/submissoes/disapprove/:idSubmissao', async (req, res) => {
    try {
        const { idSubmissao } = req.params;
        const { feedback } = req.body;

        const submissao = await Submissao.findById(idSubmissao);

        if (!submissao) {
            return res.status(404).json({ msg: 'Submissão não encontrada.' });
        }

        if (submissao.status === 'reprovada') {
            return res.status(400).json({ msg: 'Submissão já reprovada.' });
        }
        if (feedback === '' || !feedback) {
            return res.status(400).json({ msg: 'Para reprovar a submissão, é necessário justificar a reprovação.' });
        }
        submissao.status = 'reprovada';
        submissao.feedback = feedback;
        await submissao.save();

        res.status(200).json({ msg: 'Submissão reprovada com sucesso.' });
    } catch (error) {
        console.error('Erro ao reprovar submissão:', error);
        res.status(500).json({ msg: 'Erro interno do servidor' });
    }
});

router.patch('/submissoes/reevaluate/:idSubmissao', async (req, res) => {
    try {
        const { idSubmissao } = req.params;

        const submissao = await Submissao.findById(idSubmissao);

        if (!submissao) {
            return res.status(404).json({ msg: 'Submissão não encontrada.' });
        }

        if (submissao.status === 'pendente') {
            return res.status(400).json({ msg: 'Submissão já está pendente de avaliação.' });
        }
       
        submissao.status = 'pendente';
        submissao.feedback = '';
        await submissao.save();

        res.status(200).json({ msg: 'Submissão deve ser reavaliada.' });
    } catch (error) {
        console.error('Erro ao aprovar submissão:', error);
        res.status(500).json({ msg: 'Erro interno do servidor' });
    }
});

module.exports = router;
