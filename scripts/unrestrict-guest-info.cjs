require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/casa-pampulha';

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado ao MongoDB');

    const GuestInfo = mongoose.models.GuestInfo || mongoose.model('GuestInfo', new mongoose.Schema({}, { strict: false }));

    const typesToUnrestrict = ['checkin', 'checkout', 'rule'];
    const res = await GuestInfo.updateMany(
      { type: { $in: typesToUnrestrict } },
      { $set: { isRestricted: false } }
    );

    console.log(`Registros atualizados: ${res.modifiedCount || res.nModified || 0}`);
    const total = await GuestInfo.countDocuments({ type: { $in: typesToUnrestrict }, isRestricted: false });
    console.log(`Total agora visível para hóspedes (types=${typesToUnrestrict.join(', ')}): ${total}`);

    process.exit(0);
  } catch (err) {
    console.error('Erro:', err);
    process.exit(1);
  } finally {
    try { await mongoose.connection.close(); } catch(e){}
  }
}

if (require.main === module) run();

module.exports = { run };
