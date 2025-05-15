export interface CreateProveedorDto {
  contacto_id: number
  tipo_proveedor?: string
  // fecha_registro_proveedor is handled by defaultValue in model
  activo?: boolean // Although it has a default, allow specifying it
}

export interface UpdateProveedorDto extends Partial<CreateProveedorDto> {}
