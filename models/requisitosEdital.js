const { Schema, model } = require('mongoose');

const requisitoEditalPackageSchema = new Schema({
    nameRequisito: { type: String, required: true },  // Nome do pacote de requisitos
    requisitos: [{ type: String, required: true }]  // Lista de requisitos no pacote
}, {
    timestamps: true
});

const RequisitoPackage = model('RequisitoPackage', requisitoEditalPackageSchema);
module.exports = RequisitoPackage;