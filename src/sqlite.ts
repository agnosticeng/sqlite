import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import type { Database, Sqlite3Static } from "@sqlite.org/sqlite-wasm";

export class SQLite {
  private db: Database | undefined;
  private sqlite3: Sqlite3Static | undefined;
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.initialize();
  }

  private async initialize(): Promise<void> {
    this.sqlite3 = await sqlite3InitModule({
      print: console.log,
      printErr: console.error,
    });

    this.db = new this.sqlite3.oo1.DB(":memory:");
  }

  async exec(query: string): Promise<any[]> {
    await this.initPromise;
    if (!this.db) return [];
    return this.db.exec({ sql: query, returnValue: "resultRows" });
  }

  async export_db(): Promise<Uint8Array> {
    await this.initPromise;
    if (!this.db || !this.sqlite3) return new Uint8Array();
    return this.sqlite3.capi.sqlite3_js_db_export(this.db);
  }

  async load_db(bytes: Uint8Array, immutable: boolean = false): Promise<void> {
    await this.initPromise;
    if (!this.db || !this.sqlite3) return;
    if (!immutable) {
      (bytes as any).resizeable = true;
    }
    const p = this.sqlite3.wasm.allocFromTypedArray(bytes);
    let deserialize_flags = this.sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE;
    if (!immutable) {
      deserialize_flags |= this.sqlite3.capi.SQLITE_DESERIALIZE_RESIZEABLE;
    }
    const rc = this.sqlite3.capi.sqlite3_deserialize(
      this.db,
      "main",
      p,
      bytes.length,
      bytes.length,
      deserialize_flags,
    );
    if (rc !== 0) {
      throw new Error(`Failed to deserialize database: ${rc}`);
    }
  }
}
