const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const services = [
  {
    name: "Bouquet Délicat",
    description: "7 cupcakes • 2 parfums au choix",
    price: 35,
    imageUrl: "/images/bouquet-classique.jpg",
    badge: null,
    order: 0,
    active: true
  },
  {
    name: "Bouquet Charmant",
    description: "12 cupcakes • 2 parfums au choix",
    price: 60,
    imageUrl: "/images/bouquet-champetre.jpg",
    badge: "Best-seller",
    order: 1,
    active: true
  },
  {
    name: "Bouquet Pétale",
    description: "19 cupcakes • 3 parfums au choix",
    price: 90,
    imageUrl: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=800&auto=format&fit=crop",
    badge: "Idéal Cadeau",
    order: 2,
    active: true
  },
  {
    name: "Bouquet Harmonie",
    description: "24 cupcakes • 4 parfums au choix",
    price: 120,
    imageUrl: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?q=80&w=800&auto=format&fit=crop",
    badge: null,
    order: 3,
    active: true
  },
  {
    name: "Bouquet Élégance",
    description: "30 cupcakes • 4 parfums au choix",
    price: 150,
    imageUrl: "https://images.unsplash.com/photo-1587668178277-295251f900ce?q=80&w=800&auto=format&fit=crop",
    badge: "Événements",
    order: 4,
    active: true
  },
  {
    name: "Bouquet Signature",
    description: "50 cupcakes • 5 parfums au choix",
    price: 250,
    imageUrl: "https://images.unsplash.com/photo-1558326567-98ae2405596b?q=80&w=800&auto=format&fit=crop",
    badge: "Prestige",
    order: 5,
    active: true
  }
];

async function seedServices() {
  console.log("Seeding services...");
  for (const s of services) {
    await prisma.service.create({ data: s });
  }
  console.log("Done.");
}

seedServices().catch(console.error).finally(() => prisma.$disconnect());

