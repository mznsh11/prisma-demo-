-- This is an empty migration.
CREATE VIEW "popular_books" AS
SELECT 
  b.id,
  b.title,
  AVG(r.rating) AS average_rating
FROM "Book" b
JOIN "Review" r ON r."bookId" = b.id
GROUP BY b.id, b.title
HAVING AVG(r.rating) > 4;