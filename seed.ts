import { faker } from "@faker-js/faker";
import { prisma } from "./lib/prisma";

async function main() {
  // Create genres first
  const genreNames = ["Fiction", "Thriller", "Sci-Fi", "Romance", "Mystery"];
  const genres = await Promise.all(
    genreNames.map((name) =>
      prisma.genre.create({ data: { name } })
    )
  );

  // Create 5 publishers, authors and books
  for (let i = 0; i < 5; i++) {
    const publisher = await prisma.publisher.create({
      data: {
        name: faker.company.name(),
      },
    });

    const author = await prisma.author.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        books: {
          create: {
            title: faker.book.title(),
            publisherId: publisher.id,
            genres: {
              connect: [
                { id: genres[i % genres.length].id },
                { id: genres[(i + 1) % genres.length].id },
              ],
            },
          },
        },
      },
      include: {
        books: true,
      },
    });

    console.log("Created author:", author.name, "under publisher:", publisher.name);
  }

  console.log("Created genres:", genreNames);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });