const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/user');

/*typeOfUser:{
  0: prof doutor
  1: coordenador
  100: admin
}*/

// ROTA PARA BUSCA DE USUÁRIO POR MATRÍCULA
router.get("/search-users", async (req, res) => {
  try {
    const { mat } = req.query;

    // Verifique se o parâmetro de consulta 'mat' está presente
    if (!mat) {
      return res.status(400).json({ msg: 'O parâmetro de consulta "mat" é obrigatório' });
    }

    // Realize a consulta no banco de dados com base na matrícula
    // Use regex para permitir buscas parciais e ignore espaços extras
    const users = await User.find({ 
      matricula: { 
        $regex: `^${mat.trim()}`, 
        $options: 'i' 
      },
    });

    // Retorne o usuário encontrado na resposta
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuário: ', error);
    res.status(500).json({ msg: 'Erro interno do servidor' });
  }
});


//ROTA PARA RETORNAR AS INFORMAÇÕES UM ÚNICO USUÁRIO
router.get("/:id",async (req, res) => {
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
  
//ROTA PARA RETORNAR AS INFORMAÇÕES UM ÚNICO USUÁRIO POR MATRICULA
router.get('/matricula/:matricula', async (req, res) => {
  try {
    const { matricula } = req.params;
    const professor = await User.findOne({ matricula: matricula }); // Consulta o professor pela matrícula

    if (professor) {
      res.json({
        _id: professor.id,
        matricula: professor.matricula,
        name: professor.name,
        cpf: professor.cpf,
        curso: professor.curso,
        email: professor.email,
        typeOfUser: professor.typeOfUser
      });
    } else {
      res.status(404).json({ msg: 'Professor não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao consultar o Professor' });
  }
});

  //Adicionando autorização nas rotas
function checkToken(req,res,next){
  const AuthHeader = req.headers['authorization']
  const token = AuthHeader && AuthHeader.split(" ")[1]

  if(!token){
    return res.status(401).json({msg:'Acesso Negado!'})
  }

  try{
    const secret = process.env.SECRET
      
    jwt.verify(token, secret)
      
    next()
      
  }catch(erro){
    res.status(400).json({msg:"Token inválido!"})
  }
}

//ROTA PARA RETORNAR TODOS OS USUÁRIOS
router.get('/',async (req, res) => {
  try {
    const users = await User.find().select('-password -confirmpassword -createdAt -updatedAt -__v -cpf');
    res.json(users);
  } catch(error) {
      res.status(500).json({ msg:'Erro ao consultar os Usuários'});
  }
})


//ROTA PARA ALTERAR SENHA DO USUÁRIO
// ROTA PARA ALTERAR SENHA DO USUÁRIO COM VALIDAÇÃO DA SENHA ATUAL
router.patch('/change-password/:id', async (req, res) => {
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
  