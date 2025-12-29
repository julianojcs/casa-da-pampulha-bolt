/**
 * Script para fazer upload de imagens locais para o Cloudinary
 * e atualizar as URLs no banco de dados
 *
 * Uso: node scripts/migrate-images-cloudinary.cjs
 *
 * IMPORTANTE: Execute este script apenas uma vez!
 * Faça backup do banco de dados antes de executar.
 */

const { MongoClient } = require('mongodb');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configurações
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/casapampulha';
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Mapeamento de collections e seus campos de imagem
const COLLECTION_IMAGE_FIELDS = {
  galleryitems: {
    fields: ['src', 'thumbnail'],
    folder: 'gallery'
  },
  hosts: {
    fields: ['image', 'avatar'],
    folder: 'hosts'
  },
  guests: {
    fields: ['avatar'],
    folder: 'guests'
  },
  kidsareas: {
    fields: ['image', 'images'],
    folder: 'gallery'
  },
  places: {
    fields: ['image'],
    folder: 'local-guide'
  },
  properties: {
    fields: ['heroImage', 'logo', 'images'],
    folder: 'gallery'
  }
};

// Cache de URLs já processadas
const processedUrls = new Map();

/**
 * Verifica se a URL é local (não é uma URL externa)
 */
function isLocalUrl(url) {
  if (!url || typeof url !== 'string') return false;

  // Já é URL do Cloudinary
  if (url.includes('cloudinary.com')) return false;

  // É URL externa
  if (url.startsWith('http://') || url.startsWith('https://')) return false;

  // É URL local (começa com / ou não tem protocolo)
  return url.startsWith('/') || !url.includes('://');
}

/**
 * Faz upload de um arquivo local para o Cloudinary
 */
async function uploadToCloudinary(localPath, folder) {
  // Verificar cache
  if (processedUrls.has(localPath)) {
    return processedUrls.get(localPath);
  }

  // Construir caminho completo
  const fullPath = path.join(PUBLIC_DIR, localPath);

  // Verificar se o arquivo existe
  if (!fs.existsSync(fullPath)) {
    console.log(`   ⚠️  Arquivo não encontrado: ${fullPath}`);
    return null;
  }

  try {
    // Fazer upload
    const result = await cloudinary.uploader.upload(fullPath, {
      folder: folder,
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true,
    });

    const newUrl = result.secure_url;
    processedUrls.set(localPath, newUrl);

    console.log(`   ✅ Upload: ${localPath} -> ${newUrl}`);
    return newUrl;
  } catch (error) {
    console.error(`   ❌ Erro no upload de ${localPath}:`, error.message);
    return null;
  }
}

/**
 * Processa um documento, fazendo upload das imagens
 */
async function processDocument(doc, fields, folder) {
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
          const newUrl = await uploadToCloudinary(item, folder);
          if (newUrl) {
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
      const newUrl = await uploadToCloudinary(value, folder);
      if (newUrl) {
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
  console.log('   Campos:', config.fields.join(', '));
  console.log('   Pasta Cloudinary:', config.folder);

  const collection = db.collection(collectionName);
  const documents = await collection.find({}).toArray();

  console.log(`   Documentos encontrados: ${documents.length}`);

  let updated = 0;
  let errors = 0;

  for (const doc of documents) {
    try {
      const updates = await processDocument(doc, config.fields, config.folder);

      if (updates) {
        await collection.updateOne(
          { _id: doc._id },
          { $set: updates }
        );
        updated++;
      }
    } catch (error) {
      console.error(`   ❌ Erro ao processar documento ${doc._id}:`, error.message);
      errors++;
    }
  }

  console.log(`   ✅ Atualizados: ${updated}, Erros: ${errors}`);
  return { updated, errors, total: documents.length };
}

/**
 * Faz upload de todas as imagens das pastas locais
 */
async function uploadLocalFolders() {
  console.log('\n📂 Fazendo upload de imagens das pastas locais...\n');

  const localFolders = [
    { local: 'gallery', cloudinary: 'gallery' },
    { local: 'gallery/thumbnails', cloudinary: 'gallery' },
    { local: 'images', cloudinary: 'gallery' },
  ];

  let totalUploaded = 0;

  for (const folder of localFolders) {
    const localPath = path.join(PUBLIC_DIR, folder.local);

    if (!fs.existsSync(localPath)) {
      console.log(`⏭️  Pasta não encontrada: ${localPath}`);
      continue;
    }

    console.log(`📁 Processando pasta: ${folder.local}`);

    const files = fs.readdirSync(localPath);
    const imageFiles = files.filter(f =>
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f)
    );

    console.log(`   Imagens encontradas: ${imageFiles.length}`);

    for (const file of imageFiles) {
      const localFilePath = path.join(folder.local, file);
      const result = await uploadToCloudinary('/' + localFilePath, folder.cloudinary);
      if (result) totalUploaded++;
    }
  }

  console.log(`\n✅ Total de imagens enviadas: ${totalUploaded}`);
}

async function migrateImages() {
  console.log('🚀 Iniciando migração de imagens para Cloudinary...\n');
  console.log('⚠️  ATENÇÃO: Este processo pode demorar dependendo da quantidade de imagens.\n');

  // Verificar configuração do Cloudinary
  if (!process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Credenciais do Cloudinary não configuradas!');
    console.error('   Configure as variáveis de ambiente:');
    console.error('   - CLOUDINARY_CLOUD_NAME');
    console.error('   - CLOUDINARY_API_KEY');
    console.error('   - CLOUDINARY_API_SECRET');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB\n');

    const db = client.db();

    // Primeiro, fazer upload das imagens das pastas locais
    await uploadLocalFolders();

    // Depois, atualizar as referências no banco de dados
    console.log('\n' + '='.repeat(60));
    console.log('📊 Atualizando referências no banco de dados...');
    console.log('='.repeat(60));

    const summary = {
      totalUpdated: 0,
      totalErrors: 0,
      collections: {}
    };

    for (const [collectionName, config] of Object.entries(COLLECTION_IMAGE_FIELDS)) {
      const result = await processCollection(db, collectionName, config);
      summary.collections[collectionName] = result;
      summary.totalUpdated += result.updated;
      summary.totalErrors += result.errors;
    }

    // Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('📊 Resumo da Migração:');
    console.log('='.repeat(60));

    for (const [name, result] of Object.entries(summary.collections)) {
      console.log(`   ${name}: ${result.updated}/${result.total} atualizados`);
    }

    console.log('');
    console.log(`   Total atualizados: ${summary.totalUpdated}`);
    console.log(`   Total erros: ${summary.totalErrors}`);
    console.log(`   URLs processadas: ${processedUrls.size}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\n✅ Conexão com MongoDB fechada');
  }
}

// Executar
migrateImages()
  .then(() => {
    console.log('\n🎉 Migração concluída!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
  });
