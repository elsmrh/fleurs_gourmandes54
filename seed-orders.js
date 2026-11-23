const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding fake orders...");
  
  const names = ["Marie Dupont", "Jean Martin", "Sophie Leroy", "Lucie Bernard", "Thomas Richard", "Elodie Petit", "Nicolas Durand", "Camille Moreau", "Antoine Laurent", "Julie Simon", "Pauline Michel", "Romain Garcia", "Céline David", "Alexandre Bertin", "Marion Roux", "Entreprise XYZ", "Cabinet Dupont", "Agence Créative"];
  
  const prestations = [
    { name: "Bouquet Délicat", price: 35 },
    { name: "Box Gourmande", price: 45 },
    { name: "Bouquet Prestige", price: 65 },
    { name: "Cœur de Cupcakes", price: 40 },
    { name: "Assortiment Macarons", price: 30 }
  ];
  
  const statuses = ["PENDING", "PENDING", "PENDING", "DEVIS_SENT", "CONFIRMED", "CONFIRMED", "CANCELLED"]; // Weighted to have more pending and confirmed
  
  const orders = [];
  
  for (let i = 0; i < 45; i++) {
    const customer = names[Math.floor(Math.random() * names.length)];
    const prestation = prestations[Math.floor(Math.random() * prestations.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 60) - 10); // Some in the past, most in future
    
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 40));
    
    orders.push({
      customerName: customer,
      customerEmail: customer.toLowerCase().replace(" ", ".") + "@example.com",
      customerPhone: "06" + Math.floor(10000000 + Math.random() * 90000000).toString(),
      eventDate: eventDate,
      eventType: ["Mariage", "Anniversaire", "Baby Shower", "Autre", "Événement pro"][Math.floor(Math.random() * 5)],
      prestationId: "fake-id-" + i,
      prestationName: prestation.name,
      prestationPrice: prestation.price,
      quantity: Math.floor(Math.random() * 3) + 1,
      flavors: "Fraise, Pistache",
      status: status,
      createdAt: createdAt,
      allergies: Math.random() > 0.8 ? "Fruits à coque" : null,
      notes: Math.random() > 0.7 ? "Livraison avant 10h si possible" : null,
      message: Math.random() > 0.8 ? "Joyeux anniversaire maman !" : null
    });
  }

  await prisma.booking.createMany({
    data: orders
  });
  
  console.log(`Successfully seeded 45 orders.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

