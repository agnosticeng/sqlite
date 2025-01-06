import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import type {
  BindingSpec,
  Database,
  FlexibleString,
  Sqlite3Static,
  SqlValue,
} from "@sqlite.org/sqlite-wasm";

type Args = any[];
type Result = any;
type Callback = (args: Args, result: Result) => void;

export class SQLite {
  private db: Database | undefined;
  private sqlite3: Sqlite3Static | undefined;
  private initPromise: Promise<void>;
  private callbacks: {
    [key: string]: Callback[];
  } = {};

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

  async exec(
    query: FlexibleString,
    bind?: BindingSpec,
  ): Promise<{ [columnName: string]: SqlValue }[]> {
    await this.initPromise;
    if (!this.db) return [];
    const result = this.db.exec(query, {
      bind,
      rowMode: "object",
      returnValue: "resultRows",
    });

    this.call("exec", [query, bind], result);

    return result;
  }

  private call(event: string, args: Args, result: Result): void {
    if (!this.callbacks[event]) return;
    queueMicrotask(() => {
      for (const callback of this.callbacks[event]) {
        callback(args, result);
      }
    });
  }

  on(event: "exec", callback: (args: Args) => void): () => void {
    if (!this.callbacks[event]) this.callbacks[event] = [];
    const callbacks = this.callbacks[event];
    callbacks.push(callback);

    return () => {
      const filtered = callbacks.filter((cb) => cb !== callback);
      this.callbacks[event] = filtered;
    };
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
