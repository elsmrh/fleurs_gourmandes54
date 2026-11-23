const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const bookings = await prisma.booking.findMany();
  console.log(`Found ${bookings.length} bookings to update.`);

  for (const booking of bookings) {
    // Random date between -3 months and +6 months from now
    const newDate = new Date();
    const daysOffset = Math.floor(Math.random() * 270) - 90;
    newDate.setDate(newDate.getDate() + daysOffset);
    
    await prisma.booking.update({
      where: { id: booking.id },
      data: { eventDate: newDate }
    });
  }
  console.log("Successfully scattered orders across multiple months.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

