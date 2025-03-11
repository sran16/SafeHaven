import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Créer un utilisateur de test
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.users.create({
    data: {
      name: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
    },
  });

  console.log(`Utilisateur créé avec l'ID: ${user.id_user}`);

  // Créer quelques expériences
  const experience1 = await prisma.experiences.create({
    data: {
      content: 'Première expérience de test',
      userId: user.id_user,
    },
  });

  const experience2 = await prisma.experiences.create({
    data: {
      content: 'Deuxième expérience de test',
      userId: user.id_user,
    },
  });

  console.log(`Expériences créées avec les IDs: ${experience1.id_experience}, ${experience2.id_experience}`);

  // Créer quelques réponses
  const answer1 = await prisma.answers.create({
    data: {
      content: 'Commentaire sur la première expérience',
      userId: user.id_user,
      experienceId: experience1.id_experience,
    },
  });

  console.log(`Réponse créée avec l'ID: ${answer1.id_response}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 