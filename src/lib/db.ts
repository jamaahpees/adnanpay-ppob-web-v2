import mysql from 'mysql2/promise'

let pool: mysql.Pool | null = null

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'adnanpay_ppob',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    })
  }
  return pool
}

export async function query<T = unknown>(sql: string, values?: unknown[]): Promise<T> {
  const pool = getPool()
  const [rows] = await pool.execute(sql, values as mysql.RowDataPacket[])
  return rows as unknown as T
}
