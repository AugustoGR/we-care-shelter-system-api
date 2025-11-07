import { PrismaClient, ShelterRole } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  try {
    console.log('Starting migration...');

    // 1. Migrar owners dos shelters
    const shelters = await prisma.shelter.findMany({
      select: { id: true, ownerId: true },
    });

    console.log(`Found ${shelters.length} shelters to migrate owners`);

    for (const shelter of shelters) {
      await prisma.userShelter.upsert({
        where: {
          userId_shelterId: {
            userId: shelter.ownerId,
            shelterId: shelter.id,
          },
        },
        create: {
          userId: shelter.ownerId,
          shelterId: shelter.id,
          role: ShelterRole.OWNER,
        },
        update: {},
      });
    }

    console.log('✓ Migrated shelter owners');

    // 2. Migrar volunteers
    const volunteers = await prisma.volunteer.findMany({
      include: {
        user: true,
      },
    });

    console.log(`Found ${volunteers.length} volunteers to migrate`);

    for (const volunteer of volunteers) {
      // Verificar se já existe (pode ser owner)
      const existing = await prisma.userShelter.findUnique({
        where: {
          userId_shelterId: {
            userId: volunteer.userId,
            shelterId: volunteer.shelterId,
          },
        },
      });

      if (!existing) {
        await prisma.userShelter.create({
          data: {
            userId: volunteer.userId,
            shelterId: volunteer.shelterId,
            role: ShelterRole.VOLUNTEER,
          },
        });
      }
    }

    console.log('✓ Migrated volunteers');
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
