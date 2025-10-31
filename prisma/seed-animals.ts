import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding animals...');

  // Busca um abrigo existente para associar os animais
  const shelter = await prisma.shelter.findFirst();

  if (!shelter) {
    console.log('❌ Nenhum abrigo encontrado. Execute o seed de shelters primeiro.');
    return;
  }

  const animals = [
    {
      name: 'Tobby',
      species: 'Cachorro',
      breed: 'Labrador',
      age: 3,
      sex: 'Macho',
      health: 'Em Cuidado',
      status: 'Em Cuidado',
      care: 'Precisa de caminhadas diárias',
      rabies: true,
      cinomose: true,
      parvo: true,
      felina: false,
      shelterId: shelter.id,
    },
    {
      name: 'Mia',
      species: 'Gato',
      breed: 'Siamês',
      age: 1,
      sex: 'Fêmea',
      health: 'Saudável',
      status: 'Aguardando Adoção',
      care: 'Animal tranquilo, ideal para apartamento',
      rabies: true,
      cinomose: false,
      parvo: false,
      felina: true,
      shelterId: shelter.id,
    },
    {
      name: 'Rex',
      species: 'Cachorro',
      breed: 'Pastor Alemão',
      age: 5,
      sex: 'Macho',
      health: 'Em Cuidado',
      status: 'Em Cuidado',
      care: 'Necessita de espaço amplo e exercícios regulares',
      rabies: true,
      cinomose: true,
      parvo: true,
      felina: false,
      shelterId: shelter.id,
    },
    {
      name: 'Luna',
      species: 'Gato',
      breed: 'Persa',
      age: 2,
      sex: 'Fêmea',
      health: 'Saudável',
      status: 'Aguardando Adoção',
      care: 'Requer escovação regular devido ao pelo longo',
      rabies: true,
      cinomose: false,
      parvo: false,
      felina: true,
      shelterId: shelter.id,
    },
    {
      name: 'Max',
      species: 'Cachorro',
      breed: 'Vira-lata',
      age: 4,
      sex: 'Macho',
      health: 'Saudável',
      status: 'Aguardando Adoção',
      care: 'Animal sociável e brincalhão',
      rabies: true,
      cinomose: true,
      parvo: true,
      felina: false,
      shelterId: shelter.id,
    },
  ];

  for (const animal of animals) {
    const created = await prisma.animal.upsert({
      where: {
        id: 'temp-id-' + animal.name, // ID temporário para evitar duplicatas
      },
      update: {},
      create: animal,
    });
    console.log(`✅ Animal criado: ${created.name}`);
  }

  console.log('✨ Seed de animais concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao fazer seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
