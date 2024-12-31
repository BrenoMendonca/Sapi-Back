const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/user');

router.post('/login', async (req, res) => {
  const { matricula, password } = req.body;

  if (!matricula && !password) {
    return res.status(422).json({ msg: 'Credenciais obrigatórias' });
  }
  if (!matricula) {
    return res.status(422).json({ msg: 'Matrícula obrigatória' });
  }
  if (!password) {
    return res.status(422).json({ msg: 'Senha obrigatória' });
  }

  const user = await User.findOne({ matricula: matricula });

  if (!user) {
    return res.status(422).json({ msg: 'Matrícula não cadastrada' });
  }

  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(404).json({ msg: 'Senha inválida' });
  }

  try {
    const secret = process.env.SECRET;

    const token = jwt.sign(
      {
        id: user._id,
        matricula: user.matricula,
      },
      secret,
      { expiresIn: '24h' }
    );

    const { name, _id } = user;

    res.status(200).json({
      msg: 'Autenticação realizada com sucesso',
      user: { token, matricula, name, _id },
    });
  } catch (erro) {
    console.log(erro);
    return res.status(500).json({ msg: 'Erro no servidor' });
  }
});

module.exports = router;
