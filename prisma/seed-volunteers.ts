import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding volunteers...');

  // Buscar um shelter existente
  const shelters = await prisma.shelter.findMany({ take: 1 });

  if (shelters.length === 0) {
    console.log('⚠️  No shelters found. Please create a shelter first.');
    return;
  }

  const shelterId = shelters[0].id;

  // Buscar usuários existentes ou criar novos
  const users = await prisma.user.findMany({ take: 6 });

  if (users.length === 0) {
    console.log('⚠️  No users found. Please create users first.');
    return;
  }

  // Criar voluntários de exemplo vinculando a usuários existentes
  const volunteerData = [
    {
      phone: '(11) 98765-4321',
      skills: ['Enfermagem', 'Organização'],
      status: 'Ativo',
    },
    {
      phone: '(21) 99876-1234',
      skills: ['Logística', 'Transporte'],
      status: 'Ativo',
    },
    {
      phone: '(31) 97654-9876',
      skills: ['Psicologia', 'Apoio emocional'],
      status: 'Inativo',
    },
    {
      phone: '(41) 91234-5678',
      skills: ['Culinária', 'Limpeza'],
      status: 'Ausente',
    },
    {
      phone: '(51) 96789-0123',
      skills: ['Veterinária', 'Cuidado animal'],
      status: 'Ativo',
    },
    {
      phone: '(61) 95432-8765',
      skills: ['Manutenção', 'Eletricista'],
      status: 'Ativo',
    },
  ];

  for (let i = 0; i < Math.min(users.length, volunteerData.length); i++) {
    const user = users[i];
    const data = volunteerData[i];

    try {
      await prisma.volunteer.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          phone: data.phone,
          skills: data.skills,
          status: data.status,
          shelterId,
        },
      });
      console.log(`✅ Created volunteer for user: ${user.name}`);
    } catch (error) {
      console.log(`⚠️  User ${user.name} is already a volunteer`);
    }
  }

  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding volunteers:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
