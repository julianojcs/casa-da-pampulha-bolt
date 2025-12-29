/**
 * Script para fazer upload de todas as imagens locais para o Cloudinary
 * organizadas por pastas/categorias.
 *
 * Pastas do Cloudinary:
 * - gallery: Imagens da galeria da propriedade
 * - guests: Avatares dos hóspedes
 * - hosts: Fotos dos anfitriões
 * - local-guide: Imagens do guia local (places/pontos de interesse)
 * - logo: Logos e imagens institucionais
 *
 * Uso: node scripts/upload-images-cloudinary.cjs
 *
 * IMPORTANTE: Este script faz upload das imagens e gera um arquivo de mapeamento
 * que será usado pelo script de atualização do banco de dados.
 */

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configurações
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const OUTPUT_FILE = path.join(__dirname, 'cloudinary-mappings.json');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Mapeamento de pastas locais para pastas no Cloudinary
const FOLDER_MAPPINGS = [
  // Galeria principal
  { local: 'gallery', cloudinary: 'gallery', extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'] },
  { local: 'gallery/thumbnails', cloudinary: 'gallery/thumbnails', extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'] },

  // Imagens gerais (serão categorizadas)
  { local: 'images', cloudinary: 'auto', extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'] },
];

// Imagens específicas que vão para pastas específicas
const SPECIFIC_IMAGES = {
  // Hosts
  '/images/anfitria.png': 'hosts',
  '/images/coanfitriao.jpg': 'hosts',

  // Logos
  '/images/logo.png': 'logo',
  '/images/logo_full.png': 'logo',

  // Local Guide - todas as imagens de places
  // (identificadas pelo padrão de nome ou por não serem hosts/logos)
};

// Cache de URLs processadas
const urlMappings = {};

/**
 * Determina a pasta do Cloudinary para uma imagem específica
 */
function getCloudinaryFolder(localPath) {
  // Verificar se é uma imagem específica conhecida
  const normalizedPath = localPath.startsWith('/') ? localPath : '/' + localPath;

  if (SPECIFIC_IMAGES[normalizedPath]) {
    return SPECIFIC_IMAGES[normalizedPath];
  }

  // Hosts
  if (normalizedPath.includes('anfitria') || normalizedPath.includes('coanfitriao')) {
    return 'hosts';
  }

  // Logos
  if (normalizedPath.includes('logo')) {
    return 'logo';
  }

  // Gallery
  if (normalizedPath.startsWith('/gallery')) {
    if (normalizedPath.includes('thumbnails')) {
      return 'gallery/thumbnails';
    }
    return 'gallery';
  }

  // Imagens em /images/ que não são hosts nem logos são provavelmente local-guide
  if (normalizedPath.startsWith('/images/')) {
    const filename = path.basename(normalizedPath);
    // Se tem nome de lugar (geralmente PascalCase ou tem underscore)
    if (filename.includes('_') || /^[A-Z]/.test(filename)) {
      return 'local-guide';
    }
  }

  // Default para local-guide
  return 'local-guide';
}

/**
 * Faz upload de um arquivo para o Cloudinary
 */
async function uploadToCloudinary(localPath, folder) {
  const fullPath = path.join(PUBLIC_DIR, localPath.replace(/^\//, ''));

  if (!fs.existsSync(fullPath)) {
    console.log(`   ⚠️  Arquivo não encontrado: ${fullPath}`);
    return null;
  }

  // Verificar se já foi processado
  const normalizedPath = localPath.startsWith('/') ? localPath : '/' + localPath;
  if (urlMappings[normalizedPath]) {
    console.log(`   ⏭️  Já processado: ${normalizedPath}`);
    return urlMappings[normalizedPath];
  }

  try {
    const filename = path.basename(localPath, path.extname(localPath));

    const result = await cloudinary.uploader.upload(fullPath, {
      folder: folder,
      public_id: filename,
      resource_type: 'auto',
      overwrite: true,
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    const newUrl = result.secure_url;
    urlMappings[normalizedPath] = newUrl;

    console.log(`   ✅ ${normalizedPath} -> ${folder}/${filename}`);
    return newUrl;
  } catch (error) {
    console.error(`   ❌ Erro no upload de ${localPath}:`, error.message);
    return null;
  }
}

/**
 * Processa uma pasta local
 */
async function processLocalFolder(localFolder, cloudinaryFolder, extensions) {
  const fullPath = path.join(PUBLIC_DIR, localFolder);

  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  Pasta não encontrada: ${localFolder}`);
    return 0;
  }

  console.log(`\n📁 Processando pasta: ${localFolder}`);

  const files = fs.readdirSync(fullPath);
  const imageFiles = files.filter(f => {
    const ext = path.extname(f).toLowerCase();
    return extensions.includes(ext);
  });

  console.log(`   Imagens encontradas: ${imageFiles.length}`);

  let uploaded = 0;
  for (const file of imageFiles) {
    const localPath = '/' + path.join(localFolder, file);

    // Determinar a pasta do Cloudinary
    let targetFolder = cloudinaryFolder;
    if (cloudinaryFolder === 'auto') {
      targetFolder = getCloudinaryFolder(localPath);
    }

    const result = await uploadToCloudinary(localPath, targetFolder);
    if (result) uploaded++;
  }

  return uploaded;
}

/**
 * Lista todas as imagens existentes no Cloudinary para evitar duplicatas
 */
async function getExistingCloudinaryImages() {
  console.log('\n📋 Verificando imagens existentes no Cloudinary...');

  const folders = ['gallery', 'gallery/thumbnails', 'hosts', 'local-guide', 'logo', 'guests'];
  const existing = {};

  for (const folder of folders) {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: folder,
        max_results: 500,
      });

      for (const resource of result.resources) {
        existing[resource.public_id] = resource.secure_url;
      }
      console.log(`   ${folder}: ${result.resources.length} imagens`);
    } catch (error) {
      // Pasta pode não existir ainda
      console.log(`   ${folder}: 0 imagens (ou pasta não existe)`);
    }
  }

  return existing;
}

async function main() {
  console.log('🚀 Iniciando upload de imagens para o Cloudinary...\n');
  console.log('📂 Pastas de destino:');
  console.log('   - gallery: Imagens da galeria');
  console.log('   - gallery/thumbnails: Miniaturas da galeria');
  console.log('   - hosts: Fotos dos anfitriões');
  console.log('   - local-guide: Imagens do guia local');
  console.log('   - logo: Logos e imagens institucionais');
  console.log('   - guests: Avatares dos hóspedes\n');

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

  console.log(`✅ Cloudinary configurado: ${process.env.CLOUDINARY_CLOUD_NAME}\n`);

  // Listar imagens existentes
  const existingImages = await getExistingCloudinaryImages();
  console.log(`\n   Total de imagens existentes: ${Object.keys(existingImages).length}`);

  // Processar pastas
  let totalUploaded = 0;

  for (const mapping of FOLDER_MAPPINGS) {
    const uploaded = await processLocalFolder(
      mapping.local,
      mapping.cloudinary,
      mapping.extensions
    );
    totalUploaded += uploaded;
  }

  // Salvar mapeamentos
  const outputData = {
    generatedAt: new Date().toISOString(),
    totalMappings: Object.keys(urlMappings).length,
    mappings: urlMappings,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2));
  console.log(`\n✅ Mapeamentos salvos em: ${OUTPUT_FILE}`);

  console.log('\n' + '='.repeat(60));
  console.log('📊 Resumo do Upload:');
  console.log('='.repeat(60));
  console.log(`   Total de imagens enviadas: ${totalUploaded}`);
  console.log(`   Total de mapeamentos: ${Object.keys(urlMappings).length}`);
  console.log('='.repeat(60));

  console.log('\n🎉 Upload concluído!');
  console.log('\n📝 Próximo passo: Execute o script de atualização do banco de dados:');
  console.log('   node scripts/update-db-image-paths.cjs');
}

main().catch((error) => {
  console.error('\n💥 Erro fatal:', error);
  process.exit(1);
});
