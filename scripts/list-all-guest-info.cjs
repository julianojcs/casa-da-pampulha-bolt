require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/casa-pampulha';

async function listAll() {
  try {
    await mongoose.connect(MONGODB_URI);
    const GuestInfo = mongoose.models.GuestInfo || mongoose.model('GuestInfo', new mongoose.Schema({}, { strict: false }));
    const items = await GuestInfo.find({}).sort({ type: 1, order: 1 }).lean();
    console.log(`Found ${items.length} GuestInfo items:\n`);
    console.log('Tipo\tTítulo\tOrdem\tRestrito');
    items.forEach(it => {
      const tipo = it.type || '';
      const titulo = (it.title || '').replace(/\s+/g, ' ').trim();
      const ordem = it.order || 0;
      const restrito = it.isRestricted ? 'Sim' : 'Não';
      console.log(`${tipo}\t${titulo}\t${ordem}\t${restrito}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Erro:', err);
    process.exit(1);
  } finally {
    try { await mongoose.connection.close(); } catch(e){}
  }
}

if (require.main === module) listAll();

module.exports = { listAll };
