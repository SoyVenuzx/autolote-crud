export interface CreatePuestoDto {
  nombre_puesto: string
  descripcion?: string
  activo?: boolean
}

export interface UpdatePuestoDto extends Partial<CreatePuestoDto> {}
