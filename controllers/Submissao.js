const express = require('express');
const Submissao  = require('../models/submissao');
const Edital  = require('../models/edital');
const User = require('../models/user');
const mongoose = require('mongoose');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
require('dotenv').config();

//CRIAR SUBMISSÃO

router.post('/create-project/:editalId', authenticateToken, async (req, res) => {
    try {
      const { profId, title, description } = req.body;
      const { editalId } = req.params;
  
      // Validação dos IDs
      const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
      if (!isValidObjectId(editalId)) {
        return res.status(400).json({ msg: 'ID do edital inválido.' });
      }
      if (!isValidObjectId(profId)) {
        return res.status(400).json({ msg: 'ID do professor inválido.' });
      }
  
      // Verifica se os dados necessários foram enviados
      if (!profId || !title || !description) {
        return res.status(400).json({ msg: 'Dados de entrada incompletos.' });
      }
  
      // Busca o edital
      const edital = await Edital.findById(editalId).lean();
      if (!edital) {
        return res.status(404).json({ msg: 'Edital não encontrado.' });
      }
  
      // Busca o professor
      const prof = await User.findById(profId).lean();
      if (!prof) {
        return res.status(404).json({ msg: 'Professor não encontrado.' });
      }
  
      // Verifica se o professor já fez uma submissão para esse edital
      const existingSubmission = await Submissao.findOne({ prof: prof._id, edital: edital._id }).lean();
      if (existingSubmission) {
        return res.status(409).json({ msg: 'Este professor já submeteu um projeto para este edital.' });
      }
  
      // Cria a nova submissão
      const submission = new Submissao({
        prof: prof._id,
        edital: edital._id,
        title,
        description,
      });
  
      await submission.save();
  
      return res.status(201).json({
        msg: 'Submissão criada com sucesso.',
        data: {
          submissionId: submission._id,
          professorId: prof._id,
          editalId: edital._id,
          title: submission.title,
          description: submission.description,
        },
      });
    } catch (error) {
      console.error('Erro ao criar projeto:', error.message);
      return res.status(500).json({ msg: 'Erro interno do servidor.' });
    }
  });
  

//Listar submissoes de um edital
router.get('/getEdital/:id/submissoes', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
  
      // Validação do ID do edital
      const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
      if (!isValidObjectId) {
        return res.status(400).json({ msg: 'ID do edital inválido.' });
      }
  
      // Verificar se o edital existe
      const edital = await Edital.findById(id).lean();
      if (!edital) {
        return res.status(404).json({ msg: 'Edital não encontrado.' });
      }
  
      // Buscar todas as submissões associadas ao edital
      const submissoes = await Submissao.find({ edital: id })
        .populate('prof', 'name email') // Popula informações do professor (caso necessário)
        .lean();
  
      // Retornar as submissões
      return res.status(200).json({
        msg: 'Submissões encontradas com sucesso.',
        data: submissoes,
      });
    } catch (error) {
      console.error('Erro ao buscar submissões:', error.message);
      return res.status(500).json({ msg: 'Erro interno do servidor.' });
    }
  });
  

//Listar submissão de um edital especifico
router.get('/submissoes/:idSubmissao', authenticateToken, async (req, res) => {
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

// Rota para aprovar uma submissão
router.post('/aprovar/:submissaoId', authenticateToken, async (req, res) => {
  const { submissaoId } = req.params;

  try {
      // Verificar se a submissão existe
      const submissao = await Submissao.findById(submissaoId);
      if (!submissao) {
          return res.status(404).json({ message: 'Submissão não encontrada' });
      }

      // Verificar se o status já é "aprovada"
      if (submissao.status === 'aprovada') {
          return res.status(400).json({ message: 'Essa submissão já está aprovada' });
      }

      // Encontrar o edital relacionado à submissão
      const edital = await Edital.findById(submissao.edital);
      if (!edital) {
          return res.status(404).json({ message: 'Edital não encontrado' });
      }

      // Verificar se já existe uma submissão aprovada para o edital
      const submissaoAprovada = await Submissao.findOne({ edital: edital._id, status: 'aprovada' });
      if (submissaoAprovada) {
          return res.status(400).json({ message: 'Já existe uma submissão aprovada para este edital' });
      }

      // Atualizar a submissão para "aprovada"
      submissao.status = 'aprovada';
      await submissao.save();

      // Reprovar todas as outras submissões para o mesmo edital (se necessário)
      await Submissao.updateMany(
          { edital: edital._id, status: { $ne: 'aprovada' } },
          { status: 'reprovada' }
      );

      res.status(200).json({ message: 'Submissão aprovada com sucesso', submissao });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
