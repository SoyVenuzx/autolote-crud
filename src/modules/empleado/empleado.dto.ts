export interface CreateEmpleadoDto {
  contacto_id: number
  puesto_id: number
  fecha_contratacion?: Date | string // Permitir string en Input, convertir en el servicio de ser necesario
  fecha_desvinculacion?: Date | string | null
  activo?: boolean
}

export interface UpdateEmpleadoDto extends Partial<CreateEmpleadoDto> {}
