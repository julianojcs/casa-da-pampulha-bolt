/**
 * Script para migrar dados da collection Hosts para Users
 *
 * Esse script:
 * 1. Lê todos os documentos da collection Hosts
 * 2. Cria um User para cada Host (se não existir por email)
 * 3. Move os dados do Host para o campo host do User
 *
 * Uso: node scripts/migrate-hosts-to-users.cjs
 */

require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI não configurado no .env');
  process.exit(1);
}

async function migrateHostsToUsers() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB\n');

    const db = client.db();
    const hostsCollection = db.collection('hosts');
    const usersCollection = db.collection('users');

    // Buscar todos os hosts
    const hosts = await hostsCollection.find({}).toArray();
    console.log(`📋 Encontrados ${hosts.length} hosts para migrar\n`);

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const host of hosts) {
      console.log(`\n📌 Processando: ${host.name}`);

      // Verificar se já existe um usuário com email similar ou mesmo nome
      // Como hosts não têm email, vamos criar um email baseado no nome
      const emailFromName = host.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '.')
        .replace(/[^a-z0-9.]/g, '');

      const email = `${emailFromName}@casadapampulha.com.br`;

      // Verificar se usuário já existe
      let existingUser = await usersCollection.findOne({
        $or: [
          { email: email },
          { name: host.name },
        ]
      });

      // Dados do host para incorporar ao user
      const hostData = {
        bio: host.bio,
        photo: host.photo,
        role: host.role, // Anfitriã, Coanfitrião, etc
        languages: host.languages || [],
        responseTime: host.responseTime,
        responseRate: host.responseRate,
        isSuperhost: host.isSuperhost || false,
        joinedDate: host.joinedDate,
        isActive: host.isActive !== false,
      };

      if (existingUser) {
        // Atualizar usuário existente com dados de host
        console.log(`   ⚠️  Usuário já existe: ${existingUser.email}`);
        console.log(`   🔄 Atualizando com dados de host...`);

        await usersCollection.updateOne(
          { _id: existingUser._id },
          {
            $set: {
              host: hostData,
              avatar: host.photo || existingUser.avatar,
            }
          }
        );
        updated++;
      } else {
        // Criar novo usuário
        console.log(`   ✅ Criando novo usuário: ${email}`);

        // Gerar senha temporária
        const tempPassword = `CasaPampulha@${Math.random().toString(36).slice(-8)}`;
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const newUser = {
          email: email,
          password: hashedPassword,
          name: host.name,
          role: 'admin', // Hosts são admins
          phone: '',
          avatar: host.photo,
          isActive: true,
          emailVerified: true, // Não precisa verificar
          host: hostData,
          createdAt: host.createdAt || new Date(),
          updatedAt: new Date(),
        };

        await usersCollection.insertOne(newUser);
        created++;

        console.log(`   📧 Email: ${email}`);
        console.log(`   🔑 Senha temporária: ${tempPassword}`);
        console.log(`   ⚠️  IMPORTANTE: Altere a senha no primeiro acesso!`);
      }
    }

    console.log('\n============================================================');
    console.log('📊 Resumo da Migração:');
    console.log('============================================================');
    console.log(`   Hosts processados: ${hosts.length}`);
    console.log(`   Usuários criados: ${created}`);
    console.log(`   Usuários atualizados: ${updated}`);
    console.log(`   Pulados: ${skipped}`);
    console.log('============================================================');

    // Perguntar se deseja manter ou remover a collection hosts
    console.log('\n⚠️  A collection "hosts" ainda existe no banco.');
    console.log('   Você pode removê-la manualmente após verificar a migração.');
    console.log('   Comando: db.hosts.drop()');

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\n✅ Conexão com MongoDB fechada');
  }
}

// Executar
migrateHostsToUsers()
  .then(() => {
    console.log('\n🎉 Migração concluída!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro:', error);
    process.exit(1);
  });
