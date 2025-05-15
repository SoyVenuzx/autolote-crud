import {
  createCaracteristicaOpcional,
  getCaracteristicaOpcional
} from '@/handlers/caracteristica_opcional'
import { createColor, getColor } from '@/handlers/color'
import { createMarca, getMarca } from '@/handlers/marca'
import { createModelo, getModelo } from '@/handlers/modelo'
import {
  createTipoCombustible,
  getTipoCombustible
} from '@/handlers/tipo_combustible'
import {
  createTipoTransmision,
  getTipoTransmision
} from '@/handlers/tipo_transmision'
import { Router } from 'express'

const router = Router()

router.get('/caracteristica_opcional', getCaracteristicaOpcional)
router.post('/caracteristica_opcional', createCaracteristicaOpcional)

router.get('/color', getColor)
router.post('/color', createColor)

router.get('/marca', getMarca)
router.post('/marca', createMarca)

router.get('/modelo', getModelo)
router.post('/modelo', createModelo)

router.get('/combustible', getTipoCombustible)
router.post('/combustible', createTipoCombustible)

router.get('/transmision', getTipoTransmision)
router.post('/transmision', createTipoTransmision)

export default router
