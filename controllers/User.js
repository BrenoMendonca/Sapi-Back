const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/user');

/*typeOfUser:{
  1: prof
  2: profAvaliador
  3: superUser (Mirtha)
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
    const users = await User.find({ matricula: { $regex: mat, $options: 'i' } });

    // Verifique se há resultados
    if (users.length === 0) {
      return res.status(404).json({ msg: 'Nenhum usuário encontrado' });
    }
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
    const users = await User.find(); // Consulta todos os usuários
    res.json(users);
  } catch(error) {
      res.status(500).json({ msg:'Erro ao consultar os Usuários'});
  }
})

//ROTA PARA ALTERAR SENHA DO USUÁRIO
router.patch('/change-password/:id', async (req, res) => {
  const { id } = req.params
  const { newPassword } = req.body

  try {
    const user = await User.findById(id)

    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }

    user.confirmpassword = newPassword
    await user.save()

    res.status(200).json({ msg: 'Senha atualizada com sucesso! ', user})

  } catch(error) {
    console.error(error)

    res.status(500).json({ msg: 'Erro ao trocar a senha do usuário' })
  }
})

module.exports = router;
  