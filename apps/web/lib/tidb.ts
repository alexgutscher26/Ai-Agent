import mysql from "mysql2/promise"

let pool: mysql.Pool | null = null

export function getTiDBPool() {
  if (pool) return pool
  pool = mysql.createPool({
    host: process.env.TIDB_HOST,
    port: process.env.TIDB_PORT ? parseInt(process.env.TIDB_PORT, 10) : 4000,
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DATABASE,
    ssl: process.env.TIDB_SSL === "false" ? undefined : { minVersion: "TLSv1.2" },
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
  })
  return pool
}
