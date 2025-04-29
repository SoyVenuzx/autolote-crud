import db from '../config/db'
import User from '@/models/User.model'
import Role from '@/models/Role.model'
import seedRoles from './seedRoles'

/**
 * Script para crear un usuario administrador inicial
 */
async function createAdmin (closeConnection = true) {
  try {
    // Conectar a la base de datos
    await db.authenticate()
    console.log('Conexión a la base de datos establecida correctamente.')

    // Asegurar que existan los roles (ejecutar seedRoles primero)
    await seedRoles(false) // Pasar false para evitar que cierre la conexión

    // Los modelos ya deberían estar sincronizados por seedRoles()
    console.log('Modelo User sincronizado.')

    // Definir datos del administrador
    const adminData = {
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'Admin123!',
      isActive: true
    }

    // Crear administrador si no existe
    const [admin, created] = await User.findOrCreate({
      where: { email: adminData.email },
      defaults: adminData
    })

    if (created) {
      console.log(
        `Usuario administrador ${admin.username} creado correctamente.`
      )

      // Asignar rol de administrador
      const adminRole = await Role.findOne({ where: { name: 'admin' } })
      if (adminRole) {
        await admin.$add('roles', [adminRole.id])
        console.log('Rol de administrador asignado correctamente.')
      } else {
        console.error('No se encontró el rol de administrador.')
      }
    } else {
      console.log(`Usuario administrador ${admin.username} ya existe.`)
    }

    console.log('Proceso de creación de administrador completado.')
  } catch (error) {
    console.error('Error al crear administrador:', error)
  } finally {
    // Cerrar conexión solo si se solicita
    if (closeConnection) {
      await db.close()
    }
  }
}

// Ejecutar el script si es llamado directamente
if (require.main === module) {
  createAdmin()
    .then(() => {
      console.log('Script completado.')
      process.exit(0)
    })
    .catch(error => {
      console.error('Error en el script:', error)
      process.exit(1)
    })
}

export default createAdmin
