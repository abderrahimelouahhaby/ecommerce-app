import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma.js";
import { env } from "../src/config/env.js";

const sampleProducts = [
  {
    name: "Classic Cotton T-Shirt",
    description:
      "A soft, comfortable everyday t-shirt in a classic fit.",
    price: 19.99,
    stock: 50,
    imageUrl: "https://placehold.co/600x400/png?text=T-Shirt",
  },
  {
    name: "Slim Fit Jeans",
    description:
      "Dark wash slim fit jeans made from durable denim.",
    price: 59.99,
    stock: 30,
    imageUrl: "https://placehold.co/600x400/png?text=Jeans",
  },
  {
    name: "Running Sneakers",
    description:
      "Lightweight sneakers with cushioned soles for daily runs.",
    price: 79.99,
    stock: 25,
    imageUrl: "https://placehold.co/600x400/png?text=Sneakers",
  },
  {
    name: "Zip-Up Hoodie",
    description:
      "Warm cotton-blend hoodie with front pockets.",
    price: 49.99,
    stock: 40,
    imageUrl: "https://placehold.co/600x400/png?text=Hoodie",
  },
  {
    name: "Canvas Backpack",
    description:
      "Roomy canvas backpack with a padded laptop sleeve.",
    price: 39.99,
    stock: 35,
    imageUrl: "https://placehold.co/600x400/png?text=Backpack",
  },
  {
    name: "Baseball Cap",
    description:
      "Adjustable cap in classic black with an embroidered logo.",
    price: 24.99,
    stock: 60,
    imageUrl: "https://placehold.co/600x400/png?text=Cap",
  },
];

async function main() {
  // 1. First Admin — safe to run twice (upsert by email).
  if (env.SEED_ADMIN_EMAIL && env.SEED_ADMIN_PASSWORD) {
    await prisma.user.upsert({
      where: { email: env.SEED_ADMIN_EMAIL },
      update: {},
      create: {
        email: env.SEED_ADMIN_EMAIL,
        passwordHash: await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 12),
        firstName: "Shop",
        lastName: "Owner",
        role: "ADMIN",
      },
    });

    console.log(`✔ Seeded admin: ${env.SEED_ADMIN_EMAIL}`);
  } else {
    console.log(
      "⏭  SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipping admin."
    );
  }

  // 2. Sample products, only when the catalogue is empty.
  const productCount = await prisma.product.count();

  if (productCount === 0) {
    await prisma.product.createMany({ data: sampleProducts });
    console.log(`✔ Seeded ${sampleProducts.length} sample products.`);
  } else {
    console.log(`⏭  ${productCount} products exist — skipping product seed.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());