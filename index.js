#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import mysql from "mysql2/promise";
import { dbConfig } from "./config.js";

const pool = mysql.createPool({
    ...dbConfig,
});

const server = new McpServer({
    name: "mcp-db-server",
    version: "1.0.0",
});

// 工具1：执行 SQL 查询（仅 SELECT）
server.registerTool(
    "db.query",
    {
        title: "Execute SQL Query",
        description: "Execute a SQL SELECT query on the database",
        inputSchema: z.object({
            sql: z.string().describe("SQL query to execute"),
        }),
    },
    async ({ sql }) => {
        if (!sql.trim().toLowerCase().startsWith("select")) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Only SELECT statements are allowed.",
                    },
                ],
            };
        }
        try {
            const [rows] = await pool.query(sql);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(rows, null, 2),
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `SQL Error: ${error.message}`,
                    },
                ],
            };
        }
    }
);

// 工具2：列出所有表
server.registerTool(
    "db.tables",
    {
        title: "List Database Tables",
        description: "List all tables in current database",
        inputSchema: z.object({}),
    },
    async () => {
        const [rows] = await pool.query("SHOW TABLES");
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(rows, null, 2),
                },
            ],
        };
    }
);

// 工具3：查看表结构
server.registerTool(
    "db.describeTable",
    {
        title: "Describe Table Structure",
        description: "Get column definitions of a table",
        inputSchema: z.object({
            table: z.string().describe("Table name"),
        }),
    },
    async ({ table }) => {
        if (!/^[a-zA-Z0-9_]+$/.test(table)) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Invalid table name",
                    },
                ],
            };
        }
        const [rows] = await pool.query(`DESCRIBE \`${table}\``);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(rows, null, 2),
                },
            ],
        };
    }
);

// 工具4：数据库健康检查
server.registerTool(
    "db.health",
    {
        title: "Database Health Check",
        description: "Check whether database connection is available",
        inputSchema: z.object({}),
    },
    async () => {
        try {
            const conn = await pool.getConnection();
            await conn.ping();
            conn.release();
            return {
                content: [
                    {
                        type: "text",
                        text: "Database connection is OK",
                    },
                ],
            };
        } catch (err) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Database connection failed: ${err.message}`,
                    },
                ],
            };
        }
    }
);

// 启动时测试数据库连接
async function testDbConnection() {
    try {
        const conn = await pool.getConnection();
        await conn.ping();
        conn.release();
        process.stderr.write("[MCP][DB] Database connection successful\n");
    } catch (err) {
        process.stderr.write(`[MCP][DB] Database connection failed: ${err.message}\n`);
    }
}

await testDbConnection();

// 启动 MCP 服务器
const transport = new StdioServerTransport();
await server.connect(transport);

process.stderr.write("[MCP] Server ready, waiting for initialize\n");
