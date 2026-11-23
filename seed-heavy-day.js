const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding 10 orders for today...");
  
  const names = ["Test Un", "Test Deux", "Test Trois", "Test Quatre", "Test Cinq", "Test Six", "Test Sept", "Test Huit", "Test Neuf", "Test Dix"];
  const statuses = ["PENDING", "CONFIRMED", "DEVIS_SENT", "CONFIRMED", "PENDING", "CANCELLED", "CONFIRMED", "PENDING", "DEVIS_SENT", "CONFIRMED"];
  
  const targetDate = new Date(); // Aujourd'hui
  targetDate.setHours(12, 0, 0, 0);
  
  const orders = names.map((name, index) => ({
    customerName: name + " (Test)",
    customerEmail: `test${index}@example.com`,
    customerPhone: "0600000000",
    eventDate: targetDate,
    eventType: "Test intensif",
    prestationName: "Bouquet Test UI",
    prestationPrice: 50,
    quantity: 1,
    status: statuses[index],
    createdAt: new Date(),
  }));

  await prisma.booking.createMany({
    data: orders
  });
  
  console.log("Successfully seeded 10 orders on today's date.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

