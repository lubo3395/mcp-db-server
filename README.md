# mcp-db-server

[![npm version](https://img.shields.io/npm/v/mcp-db-server.svg)](https://www.npmjs.com/package/mcp-db-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server for MySQL database operations.

## Installation

```bash
npm install -g mcp-db-server
```

Or use directly with npx:

```bash
npx mcp-db-server
```

## Features

-   `db.query` - Execute SELECT queries
-   `db.execute` - Execute write operations (INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, etc.)
-   `db.tables` - List all database tables
-   `db.describeTable` - View table structure
-   `db.health` - Check database connection

## Usage

Add to your VS Code `.vscode/mcp.json`:

```json
{
    "servers": {
        "mcp-db-server": {
            "command": "npx",
            "args": ["-y", "mcp-db-server@latest"],
            "env": {
                "DB_HOST": "localhost",
                "DB_PORT": "3306",
                "DB_USER": "root",
                "DB_PASSWORD": "your_password",
                "DB_NAME": "your_database"
            }
        }
    }
}
```

## Environment Variables

| Variable     | Description          | Default   |
| ------------ | -------------------- | --------- |
| DB_HOST      | Database host        | localhost |
| DB_PORT      | Database port        | 3306      |
| DB_USER      | Database user        | root      |
| DB_PASSWORD  | Database password    | (empty)   |
| DB_NAME      | Database name        | test      |
| DB_POOL_SIZE | Connection pool size | 5         |

## Requirements

- Node.js >= 18.0.0
- MySQL database

## License

MIT © [lubo3395](https://github.com/lubo3395)
