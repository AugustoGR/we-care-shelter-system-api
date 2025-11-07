import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para verificar e corrigir chaves de módulos incorretas no banco de dados
 */
async function validateAndFixModuleKeys() {
  console.log('🔍 Verificando chaves de módulos...\n');

  // Chaves válidas
  const validKeys = ['people', 'resources', 'volunteers', 'animals', 'reports'];

  // 1. Verificar chaves inválidas
  const invalidModules = await prisma.shelterModule.findMany({
    where: {
      moduleKey: {
        notIn: validKeys,
      },
    },
    include: {
      shelter: {
        select: {
          name: true,
        },
      },
    },
  });

  if (invalidModules.length > 0) {
    console.log('❌ Encontradas chaves inválidas:');
    invalidModules.forEach((mod) => {
      console.log(`  - Abrigo: ${mod.shelter.name}`);
      console.log(`    Chave inválida: "${mod.moduleKey}"`);
      console.log(`    ID do módulo: ${mod.id}\n`);
    });

    // Correção específica: shelteredPeople -> people
    const shelteredPeopleModules = invalidModules.filter(
      (m) => m.moduleKey === 'shelteredPeople',
    );

    if (shelteredPeopleModules.length > 0) {
      console.log(
        `🔧 Corrigindo ${shelteredPeopleModules.length} módulo(s) "shelteredPeople" -> "people"...\n`,
      );

      for (const mod of shelteredPeopleModules) {
        await prisma.shelterModule.update({
          where: { id: mod.id },
          data: { moduleKey: 'people' },
        });
        console.log(`✅ Módulo ${mod.id} corrigido`);
      }
    }

    // Deletar outras chaves inválidas (não reconhecidas)
    const otherInvalid = invalidModules.filter(
      (m) => m.moduleKey !== 'shelteredPeople',
    );

    if (otherInvalid.length > 0) {
      console.log(
        `\n⚠️  Atenção: ${otherInvalid.length} módulo(s) com chaves não reconhecidas:`,
      );
      otherInvalid.forEach((mod) => {
        console.log(`  - "${mod.moduleKey}" no abrigo ${mod.shelter.name}`);
      });
      console.log('\n❓ Deseja deletá-los? (execute manualmente se necessário)');
    }
  } else {
    console.log('✅ Todas as chaves de módulos estão corretas!\n');
  }

  // 2. Verificar se todos os abrigos têm os 5 módulos padrão
  const shelters = await prisma.shelter.findMany({
    include: {
      modules: true,
    },
  });

  console.log('\n📊 Verificando módulos por abrigo:\n');

  for (const shelter of shelters) {
    const moduleKeys = shelter.modules.map((m) => m.moduleKey);
    const missing = validKeys.filter((key) => !moduleKeys.includes(key));
    const extra = moduleKeys.filter((key) => !validKeys.includes(key));

    if (missing.length > 0 || extra.length > 0) {
      console.log(`⚠️  Abrigo: ${shelter.name} (${shelter.id})`);
      if (missing.length > 0) {
        console.log(`   Módulos faltando: ${missing.join(', ')}`);
      }
      if (extra.length > 0) {
        console.log(`   Módulos extras: ${extra.join(', ')}`);
      }

      // Criar módulos faltantes
      if (missing.length > 0) {
        console.log(`   🔧 Criando módulos faltantes...`);
        for (const key of missing) {
          const active = ['people', 'resources', 'volunteers'].includes(key);
          await prisma.shelterModule.create({
            data: {
              shelterId: shelter.id,
              moduleKey: key,
              active,
            },
          });
          console.log(`   ✅ Módulo "${key}" criado`);
        }
      }
      console.log();
    } else {
      console.log(`✅ ${shelter.name}: Todos os módulos presentes`);
    }
  }

  // 3. Estatísticas finais
  const totalShelters = await prisma.shelter.count();
  const totalModules = await prisma.shelterModule.count();
  const expectedModules = totalShelters * 5;

  console.log('\n📈 Estatísticas:');
  console.log(`   Total de abrigos: ${totalShelters}`);
  console.log(`   Total de módulos: ${totalModules}`);
  console.log(`   Módulos esperados: ${expectedModules}`);

  if (totalModules === expectedModules) {
    console.log('   ✅ Tudo correto!\n');
  } else {
    console.log(
      `   ⚠️  Diferença de ${Math.abs(totalModules - expectedModules)} módulo(s)\n`,
    );
  }

  // 4. Listar distribuição de módulos
  const moduleCounts = await prisma.shelterModule.groupBy({
    by: ['moduleKey'],
    _count: true,
  });

  console.log('📊 Distribuição de módulos:');
  moduleCounts.forEach((count) => {
    const status = validKeys.includes(count.moduleKey) ? '✅' : '❌';
    console.log(`   ${status} ${count.moduleKey}: ${count._count} abrigo(s)`);
  });
}

// Executar
validateAndFixModuleKeys()
  .then(() => {
    console.log('\n✅ Validação concluída!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro durante validação:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
