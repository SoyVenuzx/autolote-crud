import { Sequelize } from 'sequelize-typescript'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

const db = new Sequelize({
  dialect: 'postgres', // Especifica el dialecto de la base de datos
  host: process.env.DB_HOST, // Lee el host del .env (ej: localhost)
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432, // Lee el puerto del .env (ej: 5432), usa 5432 por defecto si no está definido
  database: process.env.DB_DATABASE, // Lee el nombre de la base de datos del .env
  username: process.env.DB_USER, // Lee el usuario del .env
  password: process.env.DB_PASSWORD,

  models: [path.join(__dirname, '../models/**/*.ts')],
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})

export default db
