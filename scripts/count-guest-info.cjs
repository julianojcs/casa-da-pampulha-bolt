require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/casa-pampulha';

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    const GuestInfo = mongoose.models.GuestInfo || mongoose.model('GuestInfo', new mongoose.Schema({}, { strict: false }));

    const total = await GuestInfo.countDocuments();
    const visible = await GuestInfo.countDocuments({ isRestricted: false });

    const byType = await GuestInfo.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const visibleByType = await GuestInfo.aggregate([
      { $match: { isRestricted: false } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('Total documents in guestinfos:', total);
    console.log('Documents with isRestricted=false:', visible);
    console.log('\nCount by type:');
    byType.forEach(b => console.log(` - ${b._id}: ${b.count}`));
    console.log('\nVisible (isRestricted=false) by type:');
    visibleByType.forEach(b => console.log(` - ${b._id}: ${b.count}`));

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
