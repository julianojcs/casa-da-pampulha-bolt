require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/casa-pampulha';

async function updateCalendarUrl() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    const Property = mongoose.models.Property || mongoose.model('Property', new mongoose.Schema({}, { strict: false }));

    const result = await Property.updateMany(
      {},
      { $set: { airbnbCalendarUrl: 'https://www.airbnb.com.br/calendar/ical/1028115044709052736.ics?t=b0844288173d4a2792d06ab35a945a78' } }
    );

    console.log(`✅ ${result.modifiedCount || result.nModified || 0} documento(s) atualizado(s) com airbnbCalendarUrl`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err);
    process.exit(1);
  } finally {
    try { await mongoose.connection.close(); } catch(e){}
  }
}

if (require.main === module) updateCalendarUrl();

module.exports = { updateCalendarUrl };
