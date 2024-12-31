const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/user');
require('dotenv').config();
const authenticateToken = require('../middleware/auth');
const masterPassword = process.env.SECRET;

/*typeOfUser:{
  0: prof doutor
  1: coordenador
  100: admin
}*/

//--ROTAS DE PESQUISA DE USUÁRIOS--
// --Rotas Publicas--

//Rota retorno todos os usuários
router.get('/',async (req, res) => {
  try {
    const users = await User.find().select('-password -confirmpassword -createdAt -updatedAt -__v -cpf ');
    res.json(users);
  } catch(error) {
      res.status(500).json({ msg:'Erro ao consultar os Usuários'});
  }
})

//Rota para retornar um usuário via matricula
router.get('/mat/:matricula', async (req, res) => {
  try {
    const { matricula } = req.params;
    const professor = await User.findOne({ matricula: matricula }); // Consulta o professor pela matrícula

    if (professor) {
      res.json({
        matricula: professor.matricula,
        name: professor.name,
        curso: professor.curso,
        email: professor.email,
      });
    } else {
      res.status(404).json({ msg: 'Professor não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao consultar o Professor' });
  }
});

// --Rotas Privadas--

// Rota para busca por termo de matricula
router.get("/search-user-term", authenticateToken, async (req, res) => {
  try {
    const { mat } = req.query;

    // Verifique se o parâmetro de consulta 'mat' está presente
    if (!mat) {
      return res.status(400).json({ msg: 'O parâmetro de consulta "mat" é obrigatório' });
    }

    // Realiza a consulta no banco de dados com base na matrícula
    // Usa regex para permitir buscas parciais e ignore espaços extras
    const users = await User.find({ 
      matricula: { 
        $regex: `^${mat.trim()}`, 
        $options: 'i' 
      },
    });

    //Retorno do usuário encontrado na pesquisa
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuário: ', error);
    res.status(500).json({ msg: 'Erro interno do servidor' });
  }
});


//Rota para retornar um usuário via ID
router.get("/id/:id", authenticateToken ,async (req, res) => {
    const id = req.params.id;

    // Checando se o usuário existe
    const user = await User.findById(id, '-password')
      .catch((error) => {
        console.error("Erro ao buscar usuário:", error);
        return null;
      });
  
    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }
    return res.json(user);
  });



//ROTA PARA ALTERAR SENHA DO USUÁRIO

router.patch('/master-change-password/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { newPassword, masterPasswordInput } = req.body;

  // Verifique se todos os campos necessários estão presentes
  if (!newPassword || !masterPasswordInput) {
    return res.status(400).json({ msg: 'Todos os campos são obrigatórios' });
  }

  try {
    // Verificar se a senha master está correta
    if (masterPasswordInput !== masterPassword) {
      return res.status(403).json({ msg: 'Senha master inválida' });
    }

    // Buscar o usuário pelo ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }

    // Criptografar a nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Atualizar a senha do usuário
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ msg: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar a senha:', error);
    res.status(500).json({ msg: 'Erro interno do servidor' });
  }
  
});

// Rota para alterar senha com validação da senha atual
router.patch('/change-password/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {
    // Encontra o usuário pelo ID
    const user = await User.findById(id);

    // Verifica se o usuário existe
    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }

    // Verifica se a senha atual está correta
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Senha atual incorreta' });
    }

    // Verifica se a senha atual é a mesma que a nova senha
    if (currentPassword === newPassword) {
      return res.status(400).json({ msg: 'A nova senha não pode ser igual à senha atual.' });
    }

    // Verifica se a nova senha e a confirmação de senha são iguais
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ msg: 'As senhas não coincidem.' });
    }

    // Faz o hash da nova senha antes de salvá-la
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Atualiza a senha do usuário
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ msg: 'Senha atualizada com sucesso!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Erro ao trocar a senha do usuário' });
  }
});





router.get
module.exports = router;
  