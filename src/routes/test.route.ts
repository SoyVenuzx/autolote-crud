import { getCaracteristicaOpcional } from '@/handlers/caracteristica_opcional'
import { getColor } from '@/handlers/color'
import { getMarca } from '@/handlers/marca'
import { getModelo } from '@/handlers/modelo'
import { getPuesto } from '@/handlers/puesto'
import { getTipoCombustible } from '@/handlers/tipo_combustible'
import { getTipoTransmision } from '@/handlers/tipo_transmision'
import { Router } from 'express'

const router = Router()

router.get('/caracteristica_opcional', getCaracteristicaOpcional)
router.get('/color', getColor)
router.get('/marca', getMarca)
router.get('/modelo', getModelo)
router.get('/puesto', getPuesto)
router.get('/combustible', getTipoCombustible)
router.get('/transmision', getTipoTransmision)

export default router
