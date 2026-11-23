/**
 * Réinitialise (ou crée) le mot de passe d'un compte admin.
 *
 * Usage :  node scripts/reset-admin-password.js
 *
 * Prérequis : la base doit être joignable (tunnel SSH ouvert sur le port 5433).
 * Le mot de passe est saisi de façon masquée et n'est jamais stocké en clair.
 */
require("dotenv").config();
const readline = require("readline");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      // Masque la saisie avec des "*"
      rl._writeToOutput = (str) => {
        if (str.includes(question)) rl.output.write(str);
        else if (str === "\r\n" || str === "\n") rl.output.write(str);
        else rl.output.write("*");
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.trim());
    });
  });
}

async function main() {
  const users = await prisma.user.findMany({ select: { email: true, name: true } });

  console.log("\n🌸 Comptes admin existants :");
  if (users.length === 0) console.log("   (aucun — un nouveau compte sera créé)");
  users.forEach((u) => console.log(`   - ${u.email}${u.name ? ` (${u.name})` : ""}`));
  console.log("");

  const email = (await ask("Email du compte admin : ")).toLowerCase();
  if (!email.includes("@")) throw new Error("Email invalide.");

  const password = await ask("Nouveau mot de passe (8 caractères min.) : ", { hidden: true });
  if (password.length < 8) throw new Error("Mot de passe trop court (8 caractères minimum).");

  const confirm = await ask("Confirmez le mot de passe : ", { hidden: true });
  if (password !== confirm) throw new Error("Les mots de passe ne correspondent pas.");

  const hash = await bcrypt.hash(password, 12);
  const existing = users.find((u) => u.email.toLowerCase() === email);

  if (existing) {
    await prisma.user.update({ where: { email: existing.email }, data: { password: hash } });
    console.log(`\n✅ Mot de passe mis à jour pour ${existing.email}`);
  } else {
    await prisma.user.create({ data: { email, password: hash, name: "Admin" } });
    console.log(`\n✅ Nouveau compte admin créé : ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(`\n❌ ${e.message}`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
