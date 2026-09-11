const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const flavors = [
  'Vanille', 'Chocolat', 'Framboise', 'Citron', 'Pistache',
  'Caramel', 'Fraise', 'Fruits rouges', 'Praliné', 'Coco', 'Mangue', 'Passion'
];

async function main() {
  console.log('Seeding flavors...');
  for (let i = 0; i < flavors.length; i++) {
    await prisma.flavor.upsert({
      where: { name: flavors[i] },
      update: {},
      create: { name: flavors[i], active: true, order: i }
    });
  }
  console.log('✅ ' + flavors.length + ' parfums ajoutés en base !');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
