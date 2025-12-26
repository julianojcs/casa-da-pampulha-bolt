require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/casa-pampulha';

async function listCheckin() {
  try {
    await mongoose.connect(MONGODB_URI);
    const GuestInfo = mongoose.models.GuestInfo || mongoose.model('GuestInfo', new mongoose.Schema({}, { strict: false }));
    const items = await GuestInfo.find({ type: 'checkin' }).sort({ order: 1 }).lean();
    console.log(`Found ${items.length} checkin items:`);
    items.forEach((it, i) => {
      console.log(`${i+1}. ${it.title} (isRestricted=${it.isRestricted})`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Erro:', err);
    process.exit(1);
  }
}

if (require.main === module) listCheckin();

module.exports = { listCheckin };
