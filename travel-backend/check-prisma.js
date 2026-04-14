const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const models = Object.keys(prisma).filter(key => !key.startsWith('_') && typeof prisma[key] === 'object');
  console.log('Available Prisma models:', models);
}

main().catch(console.error).finally(() => prisma.$disconnect());
