import { faker } from "@faker-js/faker";
import { prisma } from "./lib/prisma";

async function main() {
  // Create genres first
  const genreNames = ["Fiction", "Thriller", "Sci-Fi", "Romance", "Mystery"];
  const genres = await Promise.all(
    genreNames.map((name) => prisma.genre.create({ data: { name } }))
  );

  // Create 5 publishers, authors and books
  const books = [];
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

    books.push(author.books[0]);
    console.log("Created author:", author.name, "under publisher:", publisher.name);
  }

  // Create 5 users
  const users = await Promise.all(
    Array.from({ length: 5 }, () =>
      prisma.user.create({
        data: {
          name: faker.person.fullName(),
        },
      })
    )
  );

  // Create reviews linking users to books
  for (let i = 0; i < 5; i++) {
    const review = await prisma.review.create({
      data: {
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.sentence(),
        userId: users[i].id,
        bookId: books[i].id,
      },
    });

    console.log("Created review with rating:", review.rating, "for book:", books[i].title);
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