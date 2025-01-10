const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Edital = require('../models/edital');
const mongoose = require('mongoose');
require('dotenv').config();
const authenticateToken = require('../middleware/auth');
const masterPassword = process.env.SECRET;          

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

//Listagem edital especifico por ID
router.get("/id/:id",authenticateToken, async (req, res) => {
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


// ROTAS DE EDICOES NO EDITAL

// Atualiza o nome do edital
router.patch("/edital-edit-name/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nameEdital } = req.body;

  try {
      // Verificar se o novo nome foi fornecido
      if (!nameEdital) {
          return res.status(400).json({ msg: "O novo nome do edital é obrigatório." });
      }


      // Atualizar o campo no banco de dados
      const editalAtualizado = await Edital.findByIdAndUpdate(
          id,
          { nameEdital },
          { new: true, runValidators: true } // Retornar o documento atualizado e aplicar validações
      );

      if (!editalAtualizado) {
          return res.status(404).json({ msg: "Edital não encontrado." });
      }

      return res.status(200).json({ msg: "Nome do edital atualizado com sucesso.", edital: editalAtualizado });
  } catch (error) {
      console.error("Erro ao atualizar o nome do edital:", error.message);
      return res.status(500).json({ msg: "Erro interno do servidor.", error: error.message });
  }
});

//Atualiza o numero do edital
router.patch("/edital-edit-num/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { numeroEdital } = req.body;

  try {
      // Verificar se o novo nome foi fornecido
      if (!numeroEdital) {
          return res.status(400).json({ msg: "O novo número do edital é obrigatório." });
      }


      // Atualizar o campo no banco de dados
      const editalAtualizado = await Edital.findByIdAndUpdate(
          id,
          { numeroEdital },
          { new: true, runValidators: true } // Retornar o documento atualizado e aplicar validações
      );

      if (!editalAtualizado) {
          return res.status(404).json({ msg: "Edital não encontrado." });
      }

      return res.status(200).json({ msg: "Numero do edital atualizado com sucesso.", edital: editalAtualizado });
  } catch (error) {
      console.error("Erro ao atualizar o numero do edital:", error.message);
      return res.status(500).json({ msg: "Erro interno do servidor.", error: error.message });
  }
});


//Atualiza o objetivo
router.patch("/edital-edit-objetivo/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { objetivo } = req.body;

  try {
      // Verificar se o novo nome foi fornecido
      if (!objetivo) {
          return res.status(400).json({ msg: "O objetivo não deve estar em branco." });
      }


      // Atualizar o campo no banco de dados
      const editalAtualizado = await Edital.findByIdAndUpdate(
          id,
          { objetivo },
          { new: true, runValidators: true } // Retornar o documento atualizado e aplicar validações
      );

      if (!editalAtualizado) {
          return res.status(404).json({ msg: "Edital não encontrado." });
      }

      return res.status(200).json({ msg: "Objetivo do edital atualizado com sucesso.", edital: editalAtualizado });
  } catch (error) {
      console.error("Erro ao atualizar o objetivo do edital:", error.message);
      return res.status(500).json({ msg: "Erro interno do servidor.", error: error.message });
  }
});

//Atualiza o Publico alvo
router.patch("/edital-edit-publico-alvo/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { publicoAlvo } = req.body;

  try {
      // Verificar se o novo nome foi fornecido
      if (!publicoAlvo) {
          return res.status(400).json({ msg: "O Público alvo não deve estar em branco." });
      }


      // Atualizar o campo no banco de dados
      const editalAtualizado = await Edital.findByIdAndUpdate(
          id,
          { publicoAlvo },
          { new: true, runValidators: true } // Retornar o documento atualizado e aplicar validações
      );

      if (!editalAtualizado) {
          return res.status(404).json({ msg: "Edital não encontrado." });
      }

      return res.status(200).json({ msg: "Público alvo do edital atualizado com sucesso.", edital: editalAtualizado });
  } catch (error) {
      console.error("Erro ao atualizar o público alvo do edital:", error.message);
      return res.status(500).json({ msg: "Erro interno do servidor.", error: error.message });
  }
});

// Adicionar professor como avaliador
router.post('/add-prof-avaliador/:id', authenticateToken, async (req, res) => {
  try {
    const editalId = req.params.id;
    const { avaliadores } = req.body;

    if (!avaliadores || !Array.isArray(avaliadores) || avaliadores.length === 0) {
      return res.status(400).json({ message: 'Por favor, forneça uma lista válida de avaliadores.' });
    }

    // Verificar se todos os IDs são válidos
    const idsValidos = avaliadores.every((id) => mongoose.Types.ObjectId.isValid(id));
    if (!idsValidos) {
      return res.status(400).json({ msg: "Um ou mais IDs de avaliadores são inválidos" });
    }

    // Verificar se os avaliadores existem no banco
    const avaliadoresExistentes = await User.find({
      '_id': { $in: avaliadores }
    });

    if (avaliadoresExistentes.length !== avaliadores.length) {
      return res.status(404).json({ msg: "Um ou mais avaliadores não encontrados no banco de dados." });
    }

    const avaliadoresObjectId = avaliadores.map(id => new mongoose.Types.ObjectId(id));

    const edital = await Edital.findById(editalId);
    if (!edital) {
      return res.status(404).json({ message: 'Edital não encontrado.' });
    }

    if (!Array.isArray(edital.profsAvaliadores)) {
      edital.profsAvaliadores = [];
    }

    // Limite de 3 avaliadores
    if (edital.profsAvaliadores.length + avaliadoresObjectId.length > 3) {
      return res.status(400).json({ message: 'Você só pode adicionar até 3 avaliadores ao edital.' });
    }

    const novosAvaliadores = avaliadoresObjectId.filter(
      id => !edital.profsAvaliadores.some(existingId => existingId.equals(id))
    );

    edital.profsAvaliadores.push(...novosAvaliadores);
    await edital.save();

    return res.status(200).json({ message: 'Avaliadores adicionados com sucesso ao edital.' });
  } catch (error) {
    console.error('Erro ao adicionar avaliadores ao edital:', error.message);
    return res.status(500).json({ message: 'Erro ao processar a requisição.', error: error.message });
  }
});

  
//Substitui professor avaliador
router.patch('/edit-prof-avaliador/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params; // ID do edital
    const { avaliadores } = req.body; // Array com os novos IDs de avaliadores

    // Valida o ID do edital
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'ID do edital inválido.' });
    }

    // Valida o array de avaliadores
    if (!Array.isArray(avaliadores) || avaliadores.length === 0) {
      return res
        .status(400)
        .json({ msg: 'Envie uma lista válida de IDs de avaliadores.' });
    }

    // Verifica se todos os IDs dos avaliadores são válidos
    const idsValidos = avaliadores.every((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );
    if (!idsValidos) {
      return res
        .status(400)
        .json({ msg: 'Um ou mais IDs de avaliadores são inválidos.' });
    }

    // Busca o edital no banco
    const edital = await Edital.findById(id);
    if (!edital) {
      return res.status(404).json({ msg: 'Edital não encontrado.' });
    }

    // Verifica se os avaliadores existem no banco
    const avaliadoresExistentes = await User.find({
      _id: { $in: avaliadores },
    });
    if (avaliadoresExistentes.length !== avaliadores.length) {
      return res
        .status(404)
        .json({ msg: 'Um ou mais avaliadores não foram encontrados no banco de dados.' });
    }

    // Substitui os avaliadores no edital
    edital.profsAvaliadores = avaliadores;

    // Salva as alterações no banco
    await edital.save();

    return res.status(200).json({
      msg: 'Avaliadores substituídos com sucesso.',
      edital,
    });
  } catch (error) {
    console.error('Erro ao substituir avaliadores:', error);
    return res.status(500).json({ msg: 'Erro interno do servidor.' });
  }
});


//Remove professor avaliador
router.delete('/remove-prof-avaliador/:id',authenticateToken, async (req, res) => {
  try {
    const { id } = req.params; // ID do edital
    const { avaliadores } = req.body; // Lista de IDs dos professores a serem removidos

    // Verifica se o ID do edital é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'ID do edital inválido.' });
    }

    // Verifica se o edital existe
    const edital = await Edital.findById(id);
    if (!edital) {
      return res.status(404).json({ msg: 'Edital não encontrado.' });
    }

    // Valida o array de IDs
    if (!Array.isArray(avaliadores) || avaliadores.length === 0) {
      return res.status(400).json({ msg: 'Envie uma lista válida de IDs de professores.' });
    }

    // Verifica se todos os IDs de professores são válidos
    const idsInvalidos = avaliadores.filter(
      (professorId) => !mongoose.Types.ObjectId.isValid(professorId)
    );

    if (idsInvalidos.length > 0) {
      return res.status(400).json({
        msg: 'Um ou mais IDs de professores são inválidos.',
        idsInvalidos,
      });
    }

    // Remove os IDs válidos que estão presentes no edital
    const avaliadoresRemovidos = [];
    avaliadores.forEach((professorId) => {
      const index = edital.profsAvaliadores.findIndex(
        (avaliadorId) => avaliadorId.toString() === professorId
      );

      if (index !== -1) {
        edital.profsAvaliadores.splice(index, 1); // Remove o avaliador
        avaliadoresRemovidos.push(professorId); // Adiciona à lista de removidos
      }
    });

    // Salva as alterações no edital
    await edital.save();

    if (avaliadoresRemovidos.length === 0) {
      return res.status(404).json({ msg: 'Nenhum dos professores avaliadores foi encontrado.' });
    }

    return res.status(200).json({
      msg: 'Professores avaliadores removidos com sucesso.',
      removidos: avaliadoresRemovidos,
    });
  } catch (error) {
    console.error('Erro ao remover professores avaliadores:', error);
    return res.status(500).json({ msg: 'Erro interno do servidor.' });
  }
});



module.exports = router;