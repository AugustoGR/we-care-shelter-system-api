import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding sheltered people...');

  // Busca um abrigo existente para associar os abrigados
  const shelter = await prisma.shelter.findFirst();

  if (!shelter) {
    console.log(
      '❌ Nenhum abrigo encontrado. Execute o seed de shelters primeiro.',
    );
    return;
  }

  const shelteredPeople = [
    {
      nome: 'João Silva',
      cpf: '123.456.789-00',
      dataNascimento: new Date('1985-03-15'),
      genero: 'Masculino',
      status: 'Ativo',
      shelterId: shelter.id,
    },
    {
      nome: 'Maria Santos',
      cpf: '987.654.321-00',
      dataNascimento: new Date('1990-07-22'),
      genero: 'Feminino',
      status: 'Ativo',
      shelterId: shelter.id,
    },
    {
      nome: 'Pedro Costa',
      cpf: '456.789.123-00',
      dataNascimento: new Date('1978-11-30'),
      genero: 'Masculino',
      status: 'Transferido',
      shelterId: shelter.id,
    },
    {
      nome: 'Ana Oliveira',
      cpf: '321.654.987-00',
      dataNascimento: new Date('2000-05-10'),
      genero: 'Feminino',
      status: 'Ativo',
      shelterId: shelter.id,
    },
    {
      nome: 'Carlos Mendes',
      cpf: '789.123.456-00',
      dataNascimento: new Date('1995-09-18'),
      genero: 'Masculino',
      status: 'Inativo',
      shelterId: shelter.id,
    },
  ];

  for (const person of shelteredPeople) {
    try {
      const created = await prisma.shelteredPerson.upsert({
        where: {
          cpf: person.cpf,
        },
        update: {},
        create: person,
      });
      console.log(`✅ Abrigado criado: ${created.nome}`);
    } catch (error) {
      console.log(`⚠️ Erro ao criar ${person.nome}:`, error.message);
    }
  }

  console.log('✨ Seed de abrigados concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao fazer seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
