const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.lichtrinh_mau.updateMany({
      where: {
        OR: [
          { trang_thai: null },
          { NOT: { trang_thai: 'APPROVED' } }
        ]
      },
      data: {
        trang_thai: 'APPROVED'
      }
    });
    console.log(`Updated ${result.count} itineraries to APPROVED status.`);
  } catch (error) {
    console.error('Error updating itineraries:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
