const mongoose = require('mongoose');
const {Schema} = mongoose;

const submissaoSchema = new Schema({
  prof: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  edital: {
    type: Schema.Types.ObjectId,
    ref: 'Edital',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
},
{
  timestamps: true
}
);

const Submissao = mongoose.model('Submissao', submissaoSchema);
module.exports = Submissao;