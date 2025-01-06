import { describe, it, expect, vi } from "vitest";
import { SQLite } from "./sqlite";

describe("SQLite database operations", () => {
  it("should test unsubscribe functionality", async () => {
    const db = new SQLite();

    const execCallback = vi.fn();
    const unsubscribe = db.on("exec", execCallback);

    await db.exec(`SELECT 1`);
    expect(execCallback).toHaveBeenCalledTimes(1);

    unsubscribe();

    await db.exec(`SELECT 2`);
    expect(execCallback).toHaveBeenCalledTimes(1);
  });

  it("should perform database operations and verify exports match", async () => {
    const db = new SQLite();

    const execCallback = vi.fn();
    db.on("exec", execCallback);

    await db.exec(`
      CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);
      INSERT INTO users (name) VALUES ('Alice'), ('Bob');
    `);

    const result = await db.exec(`SELECT * FROM users;`);

    expect(execCallback).toHaveBeenCalledTimes(2);
    expect(result).toBeDefined();

    const exportedBytes = await db.export_db();

    const db2 = new SQLite();
    await db2.load_db(exportedBytes);

    const db2Export = await db2.export_db();

    expect(exportedBytes.every((num, idx) => num === db2Export[idx])).toBe(
      true,
    );
  });
});
