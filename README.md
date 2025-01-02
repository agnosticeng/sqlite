# SQLite WASM Wrapper

A lightweight TypeScript wrapper for SQLite WebAssembly, providing a simple interface for in-memory SQLite database operations in the browser.

## Features

- In-memory SQLite database operations
- Database export and import functionality
- Asynchronous API
- TypeScript support
- Zero configuration required

## Installation

```bash
npm install @agnosticeng/sqlite-wasm-wrapper
```

## Usage

### Basic Usage

```typescript
import { SQLite } from '@agnosticeng/sqlite-wasm-wrapper';

const db = new SQLite();

// Execute queries
async function example() {
  // Create a table
  await db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      name TEXT,
      age INTEGER
    )
  `);

  // Insert data
  await db.exec(`
    INSERT INTO users (name, age) VALUES
    ('John Doe', 30),
    ('Jane Smith', 25)
  `);

  // Or use binding
  await db.exec(`
    INSERT INTO users (name, age) VALUES
    ($1, $2)
  `, ['Johnny Appleseed', 70])

  // Query data
  const results = await db.exec('SELECT * FROM users');
  console.log(results);
}
```

### Export Database

Export the current database state as a Uint8Array:

```typescript
const bytes = await db.export_db();
// Store or transmit the bytes as needed
```

### Load Database

Load a database from a Uint8Array:

```typescript
// Load database with modification capabilities
await db.load_db(bytes, false);

// Load database in immutable mode
await db.load_db(bytes, true);
```

## API Reference

### `SQLite`

#### Constructor

```typescript
const db = new SQLite();
```

Creates a new SQLite instance with an in-memory database.

#### Methods

##### `exec(query: string): Promise<any[]>`

Executes an SQL query and returns the results as an array.

- **Parameters:**
  - `query`: SQL query string
- **Returns:** Promise resolving to an array of results

##### `export_db(): Promise<Uint8Array>`

Exports the current database state.

- **Returns:** Promise resolving to a Uint8Array containing the database

##### `load_db(bytes: Uint8Array, immutable: boolean = false): Promise<void>`

Loads a database from a Uint8Array.

- **Parameters:**
  - `bytes`: Uint8Array containing the database
  - `immutable`: If true, loads the database in read-only mode

## Dependencies

- `@sqlite.org/sqlite-wasm`

## Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit your changes: `git commit -m 'Add some amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

Please make sure to:
- Update the README.md with details of changes if applicable
- Update any documentation if needed
- Add tests for new features
- Follow the existing code style
- Reference any relevant issues in your PR

## License

MIT License

Copyright (c) 2024 Agnostic

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
