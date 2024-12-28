const express = require('express');
const mongoose = require('mongoose');
const Edital = require('../models/edital');
const RequisitoPackage = require('../models/requisitosEdital');
const moment = require('moment');
const router = express.Router();

// Middleware para verificar o token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization; // Obtém o cabeçalho de autorização
  
    if (!authHeader) {
      return res.status(401).json({ msg: 'Acesso negado! Token não fornecido.' });
    }
  
    const token = authHeader.split(' ')[1]; // Extrai o token (após "Bearer ")
  
    try {
      const secret = process.env.SECRET; // Chave secreta do JWT
      const verified = jwt.verify(token, secret); // Verifica o token
      req.user = verified; // Adiciona os dados do token ao objeto req
      next(); // Permite que a execução continue
    } catch (err) {
      return res.status(403).json({ msg: 'Token inválido!' });
    }
  };
  
  // Rota protegida
  router.post("/edital", verifyToken, async (req, res) => {
    const { 
      nameEdital, 
      numeroEdital, 
      dataInicio, 
      dataFinal, 
      objetivo, 
      publicoAlvo, 
      requisitosEdital, 
      profsAvaliadores, 
      linkEdital 
    } = req.body;
  
    // Validações de campos obrigatórios
    if (!nameEdital || !numeroEdital) {
      return res.status(422).json({ msg: 'Campo(s) não informados ' });
    }
  
    // Validação de dados repetidos
    const [editalByNumero, editalByName] = await Promise.all([
      Edital.findOne({ numeroEdital: numeroEdital }),
      Edital.findOne({ nameEdital: nameEdital })
    ]);
  
    const EditalExists = editalByNumero || editalByName;
    if (EditalExists) {
      return res.status(422).json({ msg: 'Edital já cadastrado com esse numero e (ou) nome' });
    }
  
    // Validação de datas
    const dataInicioMoment = moment(dataInicio, 'DD/MM/YYYY');
    const dataFinalMoment = moment(dataFinal, 'DD/MM/YYYY');
  
    if (!dataInicioMoment.isValid() || !dataFinalMoment.isValid()) {
      return res.status(422).json({ msg: 'Formato de data inválido' });
    }
  
    if (dataInicioMoment.isSameOrAfter(dataFinalMoment)) {
      return res.status(422).json({ msg: 'A data final deve ser posterior à data de início' });
    }
  
    const formattedDataInicio = dataInicioMoment.format('L');
    const formattedDataFinal = dataFinalMoment.format('L');
  
    console.log(req.body.requisitosEdital);
    console.log("Tipo e valor de requisitoPackageId recebido:", typeof requisitosEdital, requisitosEdital);
  
    if (!mongoose.Types.ObjectId.isValid(requisitosEdital)) {
      return res.status(400).json({ msg: `ID de pacote de requisitos inválido: ${requisitosEdital}` });
    }
  
    const requisitoPackageIdObjectId = new mongoose.Types.ObjectId(requisitosEdital);
  
    const requisitoPackage = await RequisitoPackage.findById(requisitoPackageIdObjectId);
    if (!requisitoPackage) {
      console.log(`Pacote de requisitos com ID ${requisitoPackageIdObjectId} não encontrado.`);
      return res.status(404).json({ msg: 'Pacote de requisitos não encontrado' });
    }
  
    try {
      const novoEdital = new Edital({
        nameEdital,
        numeroEdital,
        dataInicio: formattedDataInicio,
        dataFinal: formattedDataFinal,
        objetivo,
        publicoAlvo,
        status: 1,
        requisitosEdital: requisitoPackageIdObjectId,
        profsAvaliadores: profsAvaliadores || [],
        linkEdital
      });
  
      await novoEdital.save();
      return res.status(200).json({ msg: 'Edital salvo com sucesso!' });
    } catch (error) {
      console.error('Erro ao salvar edital:', error);
      return res.status(500).json({ msg: 'Erro interno do servidor' });
    }
  });
  
  module.exports = router;
  