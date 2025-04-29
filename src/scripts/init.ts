import db from '@/config/db'
import seedRoles from './seedRoles'
import createAdmin from './createAdmin'

// Ejemplo para inicialización completa
async function initDatabase () {
  await db.authenticate()
  await db.drop() // ¡Cuidado! Elimina todas las tablas
  await db.sync({ force: true })
  await seedRoles(false)
  await createAdmin(false)
  // Otras operaciones de inicialización
  await db.close()
}
