// src/modules/vehiculo/vehiculo.dto.ts
import { TipoAdquisicion } from '@/models/Adquisicion.model'
import { EstadoInventario } from '@/models/Vehiculo.model'

// export interface CreateImagenVehiculoDto {
//   url_imagen: string
//   descripcion_imagen?: string
//   orden?: number
//   es_principal?: boolean
// }

export interface CreateVehiculoCaracteristicaOpcionalDto {
  caracteristica_id: number
  valor_caracteristica?: string
}

export interface UpdateVehiculoCaracteristicaOpcionalDto {
  id?: number // Para identificar existentes y actualizarlas, o crear nuevas si no hay id
  caracteristica_id: number
  valor_caracteristica?: string
  _destroy?: boolean // Para marcar para eliminación
}

export interface CreateAdquisicionDto {
  fecha_adquisicion: Date
  costo_adquisicion: number
  tipo_adquisicion: TipoAdquisicion
  proveedor_id?: number
  cliente_trade_in_id?: number
  empleado_registra_id?: number
  notas_adquisicion?: string
}

export interface UpdateAdquisicionDto {
  fecha_adquisicion?: Date
  costo_adquisicion?: number
  tipo_adquisicion?: TipoAdquisicion
  proveedor_id?: number | null
  cliente_trade_in_id?: number | null
  empleado_registra_id?: number | null
  notas_adquisicion?: string | null
}

export interface CreateVehiculoDto {
  modelo_id: number
  color_id: number
  tipo_transmision_id: number
  tipo_combustible_id: number
  anio: number
  vin: string
  numero_motor?: string
  numero_chasis?: string
  kilometraje?: number
  numero_puertas?: number
  capacidad_pasajeros?: number
  precio_base: number
  precio_venta_sugerido?: number
  descripcion_adicional?: string
  estado_inventario?: EstadoInventario
  ubicacion_fisica?: string
  adquisicion: CreateAdquisicionDto
  // imagenes?: CreateImagenVehiculoDto[]
  caracteristicasOpcionales?: CreateVehiculoCaracteristicaOpcionalDto[]
}

export interface UpdateVehiculoDto {
  modelo_id?: number
  color_id?: number
  tipo_transmision_id?: number
  tipo_combustible_id?: number
  anio?: number
  vin?: string
  numero_motor?: string | null
  numero_chasis?: string | null
  kilometraje?: number | null
  numero_puertas?: number | null
  capacidad_pasajeros?: number | null
  precio_base?: number
  precio_venta_sugerido?: number | null
  descripcion_adicional?: string | null
  estado_inventario?: EstadoInventario
  ubicacion_fisica?: string | null
  // Relaciones
  adquisicion?: UpdateAdquisicionDto // Adquisición se actualiza junto con el vehículo
  caracteristicasOpcionales?: UpdateVehiculoCaracteristicaOpcionalDto[] // Permite añadir, actualizar o eliminar características
}
