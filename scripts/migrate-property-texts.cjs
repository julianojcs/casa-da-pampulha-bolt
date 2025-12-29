/**
 * Migration script to update Property collection:
 * 1. Convert aboutDescription1/2/3 to aboutDescription array
 * 2. Add default values for new dynamic text fields
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

// Property Schema with all fields
const PropertySchema = new mongoose.Schema({
  name: String,
  tagline: String,
  description: String,
  address: String,
  city: String,
  state: String,
  country: String,
  zipCode: String,
  coordinates: { lat: Number, lng: Number },
  maxGuests: Number,
  bedrooms: Number,
  beds: Number,
  bathrooms: Number,
  rating: mongoose.Schema.Types.Decimal128,
  checkInTime: String,
  checkOutTime: String,
  minNights: Number,
  airbnbUrl: String,
  airbnbCalendarUrl: String,
  heroImage: String,
  heroImages: [String],
  welcomeMessage: String,
  phone: String,
  whatsapp: String,
  email: String,
  isActive: { type: Boolean, default: true },
  // Hero Section - dynamic texts
  heroTagline: String,
  heroSubtitle: String,
  heroHighlights: [String],
  // About Section - dynamic texts
  aboutTitle: String,
  aboutDescription: [String],
  // Legacy fields (to be removed)
  aboutDescription1: String,
  aboutDescription2: String,
  aboutDescription3: String,
}, { timestamps: true });

const Property = mongoose.models.Property || mongoose.model('Property', PropertySchema);

// Default values that were previously hardcoded in the interface
const DEFAULT_PROPERTY_UPDATES = {
  heroTagline: 'Sua casa de férias perfeita em Belo Horizonte',
  heroSubtitle: 'Piscina aquecida • Jacuzzi • Playground • Vista para a Lagoa',
  heroHighlights: [
    'Piscina aquecida',
    'Jacuzzi',
    'Playground',
    'Vista para a Lagoa'
  ],
  aboutTitle: 'Sobre a Casa',
};

// Default about descriptions that were previously hardcoded
const DEFAULT_ABOUT_DESCRIPTIONS = [
  'Bem-vindo à Casa da Pampulha, um refúgio perfeito para famílias e grupos que buscam conforto, privacidade e uma localização privilegiada em Belo Horizonte.',
  'Localizada a poucos metros da Lagoa da Pampulha, nossa casa oferece uma experiência única de hospedagem com piscina e jacuzzi aquecidas, amplo playground para crianças, área gourmet completa e muito mais.',
  'Com vários quartos confortáveis, nossa casa acomoda grupos grandes com todo o conforto e comodidade.'
];

async function migrate() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all properties
    const properties = await Property.find({});
    console.log(`📦 Found ${properties.length} properties to migrate`);

    for (const property of properties) {
      console.log(`\n🔄 Migrating property: ${property.name}`);

      const updates = {};

      // Convert aboutDescription1/2/3 to aboutDescription array
      if (property.aboutDescription1 || property.aboutDescription2 || property.aboutDescription3) {
        const descriptions = [];
        if (property.aboutDescription1) descriptions.push(property.aboutDescription1);
        if (property.aboutDescription2) descriptions.push(property.aboutDescription2);
        if (property.aboutDescription3) descriptions.push(property.aboutDescription3);

        if (descriptions.length > 0) {
          updates.aboutDescription = descriptions;
          console.log(`  ✅ Converted ${descriptions.length} paragraphs to aboutDescription array`);
        }
      }

      // If no aboutDescription exists, use defaults
      if (!property.aboutDescription || property.aboutDescription.length === 0) {
        if (!updates.aboutDescription) {
          updates.aboutDescription = DEFAULT_ABOUT_DESCRIPTIONS;
          console.log('  ✅ Added default aboutDescription');
        }
      }

      // Add heroTagline if not set
      if (!property.heroTagline) {
        updates.heroTagline = DEFAULT_PROPERTY_UPDATES.heroTagline;
        console.log('  ✅ Added default heroTagline');
      }

      // Add heroSubtitle if not set
      if (!property.heroSubtitle) {
        updates.heroSubtitle = DEFAULT_PROPERTY_UPDATES.heroSubtitle;
        console.log('  ✅ Added default heroSubtitle');
      }

      // Add heroHighlights if not set
      if (!property.heroHighlights || property.heroHighlights.length === 0) {
        updates.heroHighlights = DEFAULT_PROPERTY_UPDATES.heroHighlights;
        console.log('  ✅ Added default heroHighlights');
      }

      // Add aboutTitle if not set
      if (!property.aboutTitle) {
        updates.aboutTitle = DEFAULT_PROPERTY_UPDATES.aboutTitle;
        console.log('  ✅ Added default aboutTitle');
      }

      // Apply updates
      if (Object.keys(updates).length > 0) {
        await Property.updateOne(
          { _id: property._id },
          {
            $set: updates,
            $unset: {
              aboutDescription1: 1,
              aboutDescription2: 1,
              aboutDescription3: 1
            }
          }
        );
        console.log(`  ✅ Property updated successfully`);
      } else {
        console.log('  ℹ️ No updates needed');
      }
    }

    // If no properties exist, create a default one
    if (properties.length === 0) {
      console.log('\n📝 No properties found. Creating default property...');

      const defaultProperty = new Property({
        name: 'Casa da Pampulha',
        tagline: 'Sua casa de férias em Belo Horizonte',
        description: 'Casa completa para sua família',
        address: 'Rua Exemplo, 123',
        city: 'Belo Horizonte',
        state: 'MG',
        country: 'Brasil',
        zipCode: '31270-000',
        coordinates: { lat: -19.8510, lng: -43.9721 },
        maxGuests: 12,
        bedrooms: 4,
        beds: 7,
        bathrooms: 5,
        rating: mongoose.Types.Decimal128.fromString('4.95'),
        checkInTime: '15:00',
        checkOutTime: '11:00',
        minNights: 3,
        airbnbUrl: 'https://www.airbnb.com.br/rooms/1028115044709052736',
        airbnbCalendarUrl: '',
        heroImage: '/gallery/20240119_114828.jpg',
        heroImages: [
          '/gallery/20240119_113916.jpg',
          '/gallery/20240119_114828.jpg',
          '/gallery/20240119_114208.jpg',
          '/gallery/20240119_114312.jpg'
        ],
        welcomeMessage: 'Seja bem-vindo à Casa da Pampulha!',
        isActive: true,
        heroTagline: DEFAULT_PROPERTY_UPDATES.heroTagline,
        heroSubtitle: DEFAULT_PROPERTY_UPDATES.heroSubtitle,
        heroHighlights: DEFAULT_PROPERTY_UPDATES.heroHighlights,
        aboutTitle: DEFAULT_PROPERTY_UPDATES.aboutTitle,
        aboutDescription: DEFAULT_ABOUT_DESCRIPTIONS,
      });

      await defaultProperty.save();
      console.log('✅ Default property created');
    }

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

migrate();
