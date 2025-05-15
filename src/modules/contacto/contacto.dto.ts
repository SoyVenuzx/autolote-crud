// src/modules/contacto/contacto.dto.ts
import { TipoDocumento } from '../../models/Contacto.model'

export interface CreateContactoDto {
  nombre_completo: string
  nombre_empresa?: string
  email?: string
  telefono_principal?: string
  telefono_secundario?: string
  direccion_completa?: string
  ciudad?: string
  pais?: string
  tipo_documento?: TipoDocumento
  dni_ruc?: string
  activo?: boolean // Aunque tiene default, permitir especificarlo
}

export interface UpdateContactoDto extends Partial<CreateContactoDto> {}
