/**
 * Script para atualizar os paths de imagens no banco de dados
 * para apontar para o Cloudinary.
 *
 * Este script:
 * 1. Lê o arquivo de mapeamentos gerado pelo upload-images-cloudinary.cjs
 * 2. Atualiza todas as collections que contêm referências a imagens
 *
 * Collections atualizadas:
 * - galleryitems: src, thumbnail
 * - hosts: photo
 * - places: image
 * - properties: heroImage, heroImages
 * - kidsareas: images
 * - users: avatar
 *
 * Uso: node scripts/update-db-image-paths.cjs
 *
 * IMPORTANTE: Faça backup do banco de dados antes de executar!
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configurações
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/casapampulha';
const MAPPINGS_FILE = path.join(__dirname, 'cloudinary-mappings.json');
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;

// Mapeamento de collections e seus campos de imagem
const COLLECTION_IMAGE_FIELDS = {
  galleryitems: {
    fields: ['src', 'thumbnail'],
    type: 'string_and_array'
  },
  hosts: {
    fields: ['photo'],
    type: 'string'
  },
  places: {
    fields: ['image'],
    type: 'string'
  },
  properties: {
    fields: ['heroImage', 'heroImages'],
    type: 'string_and_array'
  },
  kidsareas: {
    fields: ['images'],
    type: 'array'
  },
  users: {
    fields: ['avatar'],
    type: 'string'
  }
};

let urlMappings = {};

/**
 * Carrega os mapeamentos do arquivo JSON
 */
function loadMappings() {
  if (!fs.existsSync(MAPPINGS_FILE)) {
    console.error(`❌ Arquivo de mapeamentos não encontrado: ${MAPPINGS_FILE}`);
    console.error('   Execute primeiro: node scripts/upload-images-cloudinary.cjs');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(MAPPINGS_FILE, 'utf-8'));
  urlMappings = data.mappings;
  console.log(`✅ Carregados ${Object.keys(urlMappings).length} mapeamentos`);
}

/**
 * Verifica se a URL é local (não é URL externa ou do Cloudinary)
 */
function isLocalUrl(url) {
  if (!url || typeof url !== 'string') return false;

  // Já é URL do Cloudinary
  if (url.includes('cloudinary.com')) return false;
  if (url.includes(CLOUDINARY_CLOUD_NAME)) return false;

  // É URL externa
  if (url.startsWith('http://') || url.startsWith('https://')) return false;

  // É URL local
  return url.startsWith('/') || !url.includes('://');
}

/**
 * Obtém a URL do Cloudinary para uma URL local
 */
function getCloudinaryUrl(localUrl) {
  if (!isLocalUrl(localUrl)) return localUrl;

  const normalizedPath = localUrl.startsWith('/') ? localUrl : '/' + localUrl;

  // Tentar encontrar no mapeamento
  if (urlMappings[normalizedPath]) {
    return urlMappings[normalizedPath];
  }

  // Tentar variações do path
  const variations = [
    normalizedPath,
    normalizedPath.replace('/gallery/', '/images/'),
    normalizedPath.replace('/images/', '/gallery/'),
  ];

  for (const variation of variations) {
    if (urlMappings[variation]) {
      return urlMappings[variation];
    }
  }

  // Não encontrado - manter original
  console.log(`   ⚠️  Mapeamento não encontrado: ${normalizedPath}`);
  return localUrl;
}

/**
 * Processa um documento, atualizando as URLs de imagens
 */
function processDocument(doc, fields) {
  const updates = {};
  let hasUpdates = false;

  for (const field of fields) {
    const value = doc[field];

    if (!value) continue;

    // Campo é um array
    if (Array.isArray(value)) {
      const newArray = [];
      let arrayChanged = false;

      for (const item of value) {
        if (isLocalUrl(item)) {
          const newUrl = getCloudinaryUrl(item);
          if (newUrl !== item) {
            newArray.push(newUrl);
            arrayChanged = true;
          } else {
            newArray.push(item);
          }
        } else {
          newArray.push(item);
        }
      }

      if (arrayChanged) {
        updates[field] = newArray;
        hasUpdates = true;
      }
    }
    // Campo é uma string
    else if (typeof value === 'string' && isLocalUrl(value)) {
      const newUrl = getCloudinaryUrl(value);
      if (newUrl !== value) {
        updates[field] = newUrl;
        hasUpdates = true;
      }
    }
  }

  return hasUpdates ? updates : null;
}

/**
 * Processa uma collection
 */
async function processCollection(db, collectionName, config) {
  console.log(`\n📁 Processando collection: ${collectionName}`);
  console.log(`   Campos: ${config.fields.join(', ')}`);

  const collection = db.collection(collectionName);
  const documents = await collection.find({}).toArray();

  console.log(`   Documentos encontrados: ${documents.length}`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const doc of documents) {
    try {
      const updates = processDocument(doc, config.fields);

      if (updates) {
        await collection.updateOne(
          { _id: doc._id },
          { $set: updates }
        );
        updated++;

        // Log das alterações
        for (const [field, newValue] of Object.entries(updates)) {
          const oldValue = doc[field];
          if (Array.isArray(newValue)) {
            console.log(`   ✅ ${doc._id}: ${field} (${newValue.length} itens atualizados)`);
          } else {
            console.log(`   ✅ ${doc._id}: ${field}`);
          }
        }
      } else {
        skipped++;
      }
    } catch (error) {
      console.error(`   ❌ Erro ao processar documento ${doc._id}:`, error.message);
      errors++;
    }
  }

  console.log(`   📊 Atualizados: ${updated}, Pulados: ${skipped}, Erros: ${errors}`);
  return { updated, skipped, errors, total: documents.length };
}

async function main() {
  console.log('🚀 Atualizando paths de imagens no banco de dados...\n');

  // Carregar mapeamentos
  loadMappings();

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB\n');

    const db = client.db();

    const summary = {
      totalUpdated: 0,
      totalSkipped: 0,
      totalErrors: 0,
      collections: {}
    };

    // Processar cada collection
    for (const [collectionName, config] of Object.entries(COLLECTION_IMAGE_FIELDS)) {
      const result = await processCollection(db, collectionName, config);
      summary.collections[collectionName] = result;
      summary.totalUpdated += result.updated;
      summary.totalSkipped += result.skipped;
      summary.totalErrors += result.errors;
    }

    // Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('📊 Resumo da Atualização:');
    console.log('='.repeat(60));

    for (const [name, result] of Object.entries(summary.collections)) {
      console.log(`   ${name}: ${result.updated}/${result.total} atualizados`);
    }

    console.log('');
    console.log(`   Total atualizados: ${summary.totalUpdated}`);
    console.log(`   Total pulados: ${summary.totalSkipped}`);
    console.log(`   Total erros: ${summary.totalErrors}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Erro durante a atualização:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\n✅ Conexão com MongoDB fechada');
  }
}

main()
  .then(() => {
    console.log('\n🎉 Atualização concluída!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
  });
