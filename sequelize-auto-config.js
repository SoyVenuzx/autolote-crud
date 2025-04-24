// sequelize-auto-config.js
require('dotenv').config() // Carga las variables de tu .env
const path = require('path') // Importa el módulo 'path'

module.exports = {
  dialect: 'postgres',
  host: process.env.DB_HOST, // Lee del .env
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432, // Lee del .env
  database: process.env.DB_DATABASE, // Lee del .env
  username: process.env.DB_USER, // Lee del .env
  password: process.env.DB_PASSWORD, // Lee del .env

  output: './src/models',

  ts: true, // Habilita TypeScript
  lang: 'ts',
  caseModel: 'c', // CamelCase para nombres de modelos
  caseProp: 'c', // camelCase para nombres de propiedades/columnas

  // *** AÑADIDA ESTA LÍNEA: Especifica explícitamente el esquema 'public' ***
  schema: 'public'
}
