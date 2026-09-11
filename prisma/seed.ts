import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultFlavors = [
  "Vanille",
  "Chocolat",
  "Framboise",
  "Citron",
  "Pistache",
  "Caramel",
  "Fraise",
  "Fruits rouges",
  "Praliné",
  "Coco",
  "Mangue",
  "Passion",
];

async function main() {
  console.log("🌸 Seeding flavors...");
  
  for (let i = 0; i < defaultFlavors.length; i++) {
    await prisma.flavor.upsert({
      where: { name: defaultFlavors[i] },
      update: {},
      create: {
        name: defaultFlavors[i],
        active: true,
        order: i,
      },
    });
  }

  console.log(`✅ ${defaultFlavors.length} flavors seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
