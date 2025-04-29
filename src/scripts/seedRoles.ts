import db from '../config/db'
import Role from '@/models/Role.model'
import User from '@/models/User.model'
import UserRole from '@/models/UserRole.model'

/**
 * Script para crear roles por defecto en la base de datos
 */
async function seedRoles (closeConnection = true) {
  try {
    // Conectar a la base de datos
    await db.authenticate()
    console.log('Conexión a la base de datos establecida correctamente.')

    // Sincronizar los modelos en orden correcto - con force: true para recrear las tablas
    // ADVERTENCIA: Solo usar force:true en desarrollo, elimina datos existentes
    await Role.sync({ force: true })
    await User.sync({ force: true })
    await UserRole.sync({ force: true })

    console.log('Modelos sincronizados correctamente.')

    // Definir roles
    const defaultRoles = [
      {
        name: 'admin',
        description: 'Administrador del sistema con acceso completo'
      },
      { name: 'user', description: 'Usuario estándar con acceso limitado' }
    ]

    // Crear roles si no existen
    for (const roleData of defaultRoles) {
      const [role, created] = await Role.findOrCreate({
        where: { name: roleData.name },
        defaults: roleData
      })
      if (created) {
        console.log(`Rol ${role.name} creado correctamente.`)
      } else {
        console.log(`Rol ${role.name} ya existe.`)
      }
    }

    console.log('Proceso de creación de roles completado.')
  } catch (error) {
    console.error('Error al crear roles:', error)
  } finally {
    // Cerrar conexión solo si se solicita
    if (closeConnection) {
      await db.close()
    }
  }
}

// Ejecutar el script si es llamado directamente
if (require.main === module) {
  seedRoles()
    .then(() => {
      console.log('Script completado.')
      process.exit(0)
    })
    .catch(error => {
      console.error('Error en el script:', error)
      process.exit(1)
    })
}

export default seedRoles
