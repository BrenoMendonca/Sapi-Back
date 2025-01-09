const express = require('express');
const mongoose = require('mongoose');
const Edital = require('../models/edital');
const User = require('../models/user');
const RequisitoPackage = require('../models/requisitosEdital');
const moment = require('moment');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

  
  // Rota protegida
  router.post("/criacao", authenticateToken, async (req, res) => {
    const {
      nameEdital,
      numeroEdital,
      dataInicio,
      dataFinal,
      objetivo,
      publicoAlvo,
      requisitosEdital,
      profsAvaliadores,
      linkEdital,
    } = req.body;

    // O creatorEdital será extraído do token JWT, que estará disponível em req.user
    const creatorEdital = req.user ? req.user.id : null; // Verifique se o usuário está presente

    if (!creatorEdital) {
        return res.status(400).json({ msg: "Usuário não autenticado, não foi possível registrar o criador do edital." });
    }

    try {
        // Validações de campos obrigatórios
        if (!nameEdital || !numeroEdital) {
            return res.status(422).json({ msg: "Campo(s) obrigatórios não informados" });
        }

        // Validação de duplicidade no banco
        const [editalByNumero, editalByName] = await Promise.all([
            Edital.findOne({ numeroEdital }),
            Edital.findOne({ nameEdital }),
        ]);

        if (editalByNumero || editalByName) {
            return res
              .status(422)
              .json({ msg: "Edital já cadastrado com esse número e/ou nome" });
        }

        // Validação de datas
        const dataInicioMoment = moment(dataInicio, "DD/MM/YYYY");
        const dataFinalMoment = moment(dataFinal, "DD/MM/YYYY");

        if (!dataInicioMoment.isValid() || !dataFinalMoment.isValid()) {
            return res.status(422).json({ msg: "Formato de data inválido" });
        }

        if (dataInicioMoment.isSameOrAfter(dataFinalMoment)) {
            return res
              .status(422)
              .json({ msg: "A data final deve ser posterior à data de início" });
        }

        // Formatar datas para o formato correto
        const formattedDataInicio = dataInicioMoment.format("YYYY-MM-DD");
        const formattedDataFinal = dataFinalMoment.format("YYYY-MM-DD");

        // Validação do pacote de requisitos
        if (!mongoose.Types.ObjectId.isValid(requisitosEdital)) {
            return res
              .status(400)
              .json({ msg: `ID de pacote de requisitos inválido: ${requisitosEdital}` });
        }

        const requisitoPackage = await RequisitoPackage.findById(requisitosEdital);
        if (!requisitoPackage) {
            return res.status(404).json({ msg: "Pacote de requisitos não encontrado" });
        }

        // Validação de profsAvaliadores
        if (profsAvaliadores) {
            if (!Array.isArray(profsAvaliadores)) {
                return res
                  .status(400)
                  .json({ msg: "O campo profsAvaliadores deve ser uma lista de IDs" });
            }

            if (profsAvaliadores.length > 3) {
                return res
                  .status(400)
                  .json({ msg: "É permitido adicionar no máximo 3 avaliadores" });
            }

            // Verificar se todos os IDs são válidos
            const idsValidos = profsAvaliadores.every((id) =>
              mongoose.Types.ObjectId.isValid(id)
            );

            if (!idsValidos) {
                return res.status(400).json({ msg: "Um ou mais IDs de avaliadores são inválidos" });
            }
        }

        // Criação do novo edital com o creatorEdital sendo o usuário autenticado
        const novoEdital = new Edital({
            nameEdital,
            numeroEdital,
            dataInicio: formattedDataInicio,
            dataFinal: formattedDataFinal,
            objetivo,
            publicoAlvo,
            status: 1,
            requisitosEdital,
            profsAvaliadores: profsAvaliadores || [],
            linkEdital,
            creatorEdital, // Atribuindo o creatorEdital com o ID do usuário autenticado
        });

        await novoEdital.save();

        return res.status(201).json({ msg: "Edital criado com sucesso!", edital: novoEdital });
    } catch (error) {
        console.error("Erro ao criar edital:", error.message);
        return res.status(500).json({ msg: "Erro interno do servidor", error: error.message });
    }
});

  
  
  module.exports = router;
  