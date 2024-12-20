import { SQLite } from "./sqlite";

(async function () {
  const db = new SQLite();
  await db.exec(`
    CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);
    INSERT INTO users (name) VALUES ('Alice'), ('Bob');
  `);

  const result = await db.exec(`SELECT * FROM users;`);
  console.log("Query result:", result);

  const exportedBytes = await db.export_db();

  const db2 = new SQLite();
  await db2.load_db(exportedBytes);

  const db2Export = await db2.export_db();

  console.log(
    "Are exports same?",
    exportedBytes.every((num, idx) => num === db2Export[idx]),
  );
})();
