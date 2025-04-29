import db from '@/config/db'
import seedRoles from './seedRoles'
import createAdmin from './createAdmin'

/**
 * Script para inicializar la base de datos con roles y usuario admin
 */
async function setup () {
  try {
    // Conectar a la base de datos
    await db.authenticate()
    console.log('Conexión a la base de datos establecida correctamente.')

    // Crear roles (sin cerrar la conexión)
    await seedRoles(false)

    // Crear administrador (sin cerrar la conexión)
    await createAdmin(false)

    console.log('Proceso de configuración inicial completado exitosamente.')
  } catch (error) {
    console.error('Error en el proceso de configuración:', error)
  } finally {
    // Cerrar conexión al final del proceso completo
    await db.close()
    console.log('Conexión a la base de datos cerrada.')
  }
}

// Ejecutar el script
if (require.main === module) {
  setup()
    .then(() => {
      console.log('Script de configuración completado.')
      process.exit(0)
    })
    .catch(error => {
      console.error('Error en el script de configuración:', error)
      process.exit(1)
    })
}

export default setup
