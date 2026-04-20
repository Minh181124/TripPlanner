const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const list = await prisma.lichtrinh_mau.findMany();
    console.log('--- ITINERARIES ---');
    console.log(JSON.stringify(list, null, 2));
    console.log('-------------------');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
