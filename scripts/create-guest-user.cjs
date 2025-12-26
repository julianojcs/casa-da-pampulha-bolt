require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/casa-pampulha';

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  role: String,
  phone: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createGuest() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado ao MongoDB');

    const email = 'guest@casadapampulha.com.br';
    const plainPassword = 'guest123';

    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Usuário já existe:', email);
      console.log('Se quiser, remova o usuário antigo ou altere a senha manualmente.');
      process.exit(0);
    }

    const hashed = await bcrypt.hash(plainPassword, 10);
    const user = await User.create({ email, password: hashed, name: 'Hóspede de Teste', role: 'guest', phone: '', isActive: true });

    console.log('Usuário criado com sucesso:');
    console.log('  email:', email);
    console.log('  senha (texto claro):', plainPassword);
    console.log('  role:', user.role);

    process.exit(0);
  } catch (err) {
    console.error('Erro criando usuário:', err);
    process.exit(1);
  }
}

if (require.main === module) createGuest();

module.exports = { createGuest };
