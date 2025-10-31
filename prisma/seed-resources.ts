import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedResources() {
  console.log('Seeding resources...');

  // Get the first shelter for seeding
  const shelter = await prisma.shelter.findFirst();

  if (!shelter) {
    console.log('No shelter found. Please seed shelters first.');
    return;
  }

  const resources = [
    {
      nome: 'Arroz 5kg',
      categoria: 'Alimentos',
      quantidade: 50,
      unidade: 'pacotes',
      validade: new Date('2025-12-31'),
      status: 'Em Estoque',
      shelterId: shelter.id,
    },
    {
      nome: 'Paracetamol 500mg',
      categoria: 'Medicamentos',
      quantidade: 12,
      unidade: 'cartelas',
      validade: new Date('2024-07-20'),
      status: 'Estoque Baixo',
      shelterId: shelter.id,
    },
    {
      nome: 'Sabonete Líquido',
      categoria: 'Higiene',
      quantidade: 30,
      unidade: 'unidades',
      validade: new Date('2026-01-15'),
      status: 'Em Estoque',
      shelterId: shelter.id,
    },
    {
      nome: 'Água Mineral 20L',
      categoria: 'Água',
      quantidade: 8,
      unidade: 'garrafões',
      validade: new Date('2025-03-10'),
      status: 'Estoque Baixo',
      shelterId: shelter.id,
    },
    {
      nome: 'Papel Higiênico',
      categoria: 'Higiene',
      quantidade: 100,
      unidade: 'rolos',
      validade: new Date('2027-08-30'),
      status: 'Em Estoque',
      shelterId: shelter.id,
    },
    {
      nome: 'Feijão Preto 1kg',
      categoria: 'Alimentos',
      quantidade: 45,
      unidade: 'pacotes',
      validade: new Date('2025-11-20'),
      status: 'Em Estoque',
      shelterId: shelter.id,
    },
    {
      nome: 'Dipirona 500mg',
      categoria: 'Medicamentos',
      quantidade: 5,
      unidade: 'cartelas',
      validade: new Date('2023-10-15'),
      status: 'Vencido',
      shelterId: shelter.id,
    },
    {
      nome: 'Leite em Pó',
      categoria: 'Alimentos',
      quantidade: 20,
      unidade: 'latas',
      validade: new Date('2024-12-05'),
      status: 'Em Estoque',
      shelterId: shelter.id,
    },
  ];

  for (const resource of resources) {
    await prisma.resource.upsert({
      where: { id: `seed-resource-${resource.nome}` },
      update: {},
      create: {
        id: `seed-resource-${resource.nome}`,
        ...resource,
      },
    });
  }

  console.log('Resources seeded successfully!');
}

// Run the seed if this file is executed directly
if (require.main === module) {
  seedResources()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
